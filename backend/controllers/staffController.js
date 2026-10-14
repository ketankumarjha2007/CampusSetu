const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Issue = require('../models/Issue');
const firebaseAuth = require('../config/firebaseAdmin');
const brevoService = require('../services/brevoService');

const ALLOWED_STAFF_ROLES = ['teacher', 'cluster_head', 'principal'];

/**
 * List all staff members (teachers, cluster heads, principals)
 */
const listStaff = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {
      role: role && ALLOWED_STAFF_ROLES.includes(role) ? role : { $in: ALLOWED_STAFF_ROLES },
    };

    const staff = await User.find(filter)
      .select('name email role department phone isActive createdAt')
      .sort({ createdAt: -1 });

    // Fetch Firebase user verification / invite state in parallel batches
    const enriched = await Promise.all(
      staff.map(async (member) => {
        const item = member.toObject();
        item.invitedAt = member.createdAt;
        item.hasLoggedIn = false;

        try {
          if (member.firebaseUid) {
            const fbRecord = await firebaseAuth.getUser(member.firebaseUid);
            item.emailVerified = fbRecord.emailVerified;
            item.disabled = fbRecord.disabled;
            item.lastLoginAt = fbRecord.metadata?.lastSignInTime || null;
            item.hasLoggedIn = Boolean(fbRecord.metadata?.lastSignInTime);
          }
        } catch {
          // If Firebase fetch fails for single record, continue
        }

        return item;
      })
    );

    return res.status(200).json({
      success: true,
      count: enriched.length,
      staff: enriched,
    });
  } catch (error) {
    console.error('List staff error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch staff members.',
    });
  }
};

/**
 * Invite/register a new staff member (teacher, cluster_head, principal)
 * Creates account in Firebase Auth + MongoDB + sends Brevo email invite
 */
const inviteStaff = async (req, res) => {
  let createdFirebaseUid = null;

  try {
    const { name, email, role = 'teacher', department, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    if (!ALLOWED_STAFF_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${ALLOWED_STAFF_ROLES.join(', ')}`,
      });
    }

    const requestedDepartment =
      typeof department === 'string' ? department.trim() : '';
    if (role === 'teacher' && !requestedDepartment) {
      return res.status(400).json({
        success: false,
        message: 'A department is required when inviting a teacher.',
      });
    }

    // Only one Principal can exist per college
    if (role === 'principal') {
      const existingPrincipal = await User.findOne({ role: 'principal' });
      if (existingPrincipal) {
        return res.status(400).json({
          success: false,
          message: `Only one Principal can exist per college. Principal ${existingPrincipal.name} (${existingPrincipal.email}) is already registered.`,
        });
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    let cleanDept = requestedDepartment;
    const cleanPhone = (phone || '').trim();

    if (role === 'teacher') {
      const activeTeachers = await User.find({
        role: 'teacher',
        isActive: true,
        department: { $type: 'string', $ne: '' },
      }).select('department');
      const normalizedDepartment = cleanDept.toLocaleLowerCase();
      const existingDepartment = activeTeachers.find(
        (teacher) =>
          teacher.department.trim().toLocaleLowerCase() ===
          normalizedDepartment
      );
      if (existingDepartment) {
        cleanDept = existingDepartment.department.trim();
      }
    }

    // Check existing in MongoDB
    const existingMongo = await User.findOne({ email: cleanEmail });
    if (existingMongo) {
      return res.status(409).json({
        success: false,
        message: `An account with this email already exists as a ${existingMongo.role}.`,
      });
    }

    // Check existing in Firebase Auth
    let firebaseUserRecord;
    let isNewFirebaseUser = false;

    try {
      firebaseUserRecord = await firebaseAuth.getUserByEmail(cleanEmail);
      const existingFbInMongo = await User.findOne({ firebaseUid: firebaseUserRecord.uid });
      if (existingFbInMongo) {
        return res.status(409).json({
          success: false,
          message: `This email is already associated with an existing ${existingFbInMongo.role} account.`,
        });
      }
    } catch (fbErr) {
      if (fbErr.code === 'auth/user-not-found') {
        firebaseUserRecord = await firebaseAuth.createUser({
          email: cleanEmail,
          emailVerified: false,
          displayName: cleanName,
        });
        isNewFirebaseUser = true;
        createdFirebaseUid = firebaseUserRecord.uid;
      } else {
        throw fbErr;
      }
    }

    // Set custom role claim in Firebase Auth
    await firebaseAuth.setCustomUserClaims(firebaseUserRecord.uid, {
      role,
    });

    // Create User record in MongoDB
    let newStaff;
    try {
      newStaff = await User.create({
        firebaseUid: firebaseUserRecord.uid,
        email: cleanEmail,
        name: cleanName,
        role,
        department: cleanDept,
        phone: cleanPhone,
        isActive: true,
      });
    } catch (mongoErr) {
      // Rollback newly created Firebase Auth account
      if (isNewFirebaseUser && createdFirebaseUid) {
        try {
          await firebaseAuth.deleteUser(createdFirebaseUid);
        } catch (cleanupErr) {
          console.error('Failed to cleanup Firebase user on Mongo rollback:', cleanupErr.message);
        }
      }
      throw mongoErr;
    }

    // Generate password setup link via Firebase Admin
    let passwordSetupLink = '';
    try {
      passwordSetupLink = await firebaseAuth.generatePasswordResetLink(cleanEmail);
    } catch (linkErr) {
      console.warn('Could not generate Firebase password reset link:', linkErr.message);
    }

    // Dispatch email via Brevo
    let emailStatus = { success: false, message: 'Brevo email not sent' };
    if (passwordSetupLink) {
      emailStatus = await brevoService.sendStaffOnboardingEmail({
        toEmail: cleanEmail,
        toName: cleanName,
        role,
        department: cleanDept,
        setupPasswordLink: passwordSetupLink,
      });
    }

    // Record audit trail
    await AuditLog.create({
      action: `INVITE_${role.toUpperCase()}`,
      performedBy: req.user._id,
      targetType: 'user',
      targetId: newStaff._id,
      details: {
        email: cleanEmail,
        name: cleanName,
        role,
        department: cleanDept,
        emailDispatched: emailStatus.success,
        emailMessageId: emailStatus.messageId || null,
        emailError: emailStatus.error || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: emailStatus.success
        ? `${role.replace('_', ' ')} invited successfully and invitation email sent.`
        : `${role.replace('_', ' ')} registered successfully. (Email delivery skipped or pending)`,
      emailDispatched: emailStatus.success,
      staff: {
        _id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        department: newStaff.department,
        phone: newStaff.phone,
        isActive: newStaff.isActive,
      },
    });
  } catch (error) {
    console.error('Invite staff error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to onboard staff member.',
    });
  }
};

/**
 * Resend set-password email invite to a staff member
 */
const resendInvite = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await User.findById(id);
    if (!staff || !ALLOWED_STAFF_ROLES.includes(staff.role)) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found.',
      });
    }

    const passwordSetupLink = await firebaseAuth.generatePasswordResetLink(staff.email);

    const emailStatus = await brevoService.sendStaffOnboardingEmail({
      toEmail: staff.email,
      toName: staff.name,
      role: staff.role,
      department: staff.department,
      setupPasswordLink,
    });

    await AuditLog.create({
      action: `RESEND_INVITE_${staff.role.toUpperCase()}`,
      performedBy: req.user._id,
      targetType: 'user',
      targetId: staff._id,
      details: {
        email: staff.email,
        emailDispatched: emailStatus.success,
        emailMessageId: emailStatus.messageId || null,
      },
    });

    return res.status(200).json({
      success: true,
      message: emailStatus.success
        ? `Invitation email successfully resent to ${staff.email}.`
        : 'Password reset link generated, but email delivery failed or Brevo API is not configured.',
      emailDispatched: emailStatus.success,
    });
  } catch (error) {
    console.error('Resend invite error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to resend invitation email.',
    });
  }
};

/**
 * Remove staff member
 */
const removeStaff = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff ID format.',
      });
    }

    const staff = await User.findById(id);
    if (!staff || !ALLOWED_STAFF_ROLES.includes(staff.role)) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found.',
      });
    }

    // If teacher, unassign any open issues
    if (staff.role === 'teacher') {
      await Issue.updateMany(
        { assignedTo: staff._id, status: { $in: ['assigned', 'in_progress'] } },
        {
          $set: { assignedTo: null, status: 'pending' },
          $push: {
            history: {
              status: 'pending',
              note: `Automatically unassigned: staff member (${staff.name}) was removed.`,
              changedBy: req.user._id,
              changedAt: new Date(),
            },
          },
        }
      );
    }

    // Delete in Firebase Auth
    if (staff.firebaseUid) {
      try {
        await firebaseAuth.deleteUser(staff.firebaseUid);
      } catch (fbErr) {
        console.warn(`Could not delete Firebase user (${staff.firebaseUid}):`, fbErr.message);
      }
    }

    // Delete in MongoDB
    await User.findByIdAndDelete(staff._id);

    // Audit log
    await AuditLog.create({
      action: `REMOVE_${staff.role.toUpperCase()}`,
      performedBy: req.user._id,
      targetType: 'user',
      targetId: staff._id,
      details: {
        name: staff.name,
        email: staff.email,
        role: staff.role,
        department: staff.department,
      },
    });

    return res.status(200).json({
      success: true,
      message: `${staff.name} (${staff.role.replace('_', ' ')}) has been removed successfully.`,
      deletedStaffId: staff._id,
    });
  } catch (error) {
    console.error('Remove staff error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove staff member.',
    });
  }
};

module.exports = {
  listStaff,
  inviteStaff,
  resendInvite,
  removeStaff,
};
