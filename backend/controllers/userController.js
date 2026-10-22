const User = require('../models/User');
const {
  sendPushNotification,
} = require('../services/notificationService');

const getCurrentUser = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUser.uid;

    const user = await User.findOne({
      firebaseUid,
    }).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      'Get current user error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
    });
  }
};

const createOrUpdateProfile = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUser.uid;

    const {
      name,
      usn,
      phone,
      department,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    if (!usn || !usn.trim()) {
      return res.status(400).json({
        success: false,
        message: 'USN is required',
      });
    }

    const trimmedName = name.trim();

    const normalizedUsn =
      usn.trim().toUpperCase();

    const existingUser =
      await User.findOne({
        usn: normalizedUsn,
        firebaseUid: {
          $ne: firebaseUid,
        },
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          'This USN is already registered with another account.',
      });
    }

    let user =
      await User.findOne({
        firebaseUid,
      });

    if (!user) {
      user = await User.create({
        firebaseUid,
        email:
          req.firebaseUser.email || '',
        name: trimmedName,
        usn: normalizedUsn,
        phone:
          phone?.trim() || '',
        department:
          department?.trim() || '',
        role: 'student',
      });

      return res.status(201).json({
        success: true,
        message: 'Student profile created',
        user,
      });
    }

    user.name = trimmedName;
    user.usn = normalizedUsn;

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (department !== undefined) {
      user.department = department.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error(
      'Create or update profile error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to save profile',
    });
  }
};

const savePushToken = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUser.uid;

    const { pushToken } = req.body;

    if (!pushToken || typeof pushToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid push token is required',
      });
    }

    const cleanToken = pushToken.trim();

    if (!cleanToken) {
      return res.status(400).json({
        success: false,
        message: 'Push token cannot be empty',
      });
    }

    // Invalidate any other accounts using this device token
    await User.updateMany(
      {
        firebaseUid: { $ne: firebaseUid },
        pushToken: cleanToken,
      },
      {
        $set: { pushToken: '' },
      }
    );

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { $set: { pushToken: cleanToken } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log(
      `Push token updated for ${user.email} (${user.role})`
    );

    return res.status(200).json({
      success: true,
      message: 'Push token saved successfully',
      pushToken: user.pushToken,
    });
  } catch (error) {
    console.error(
      'Save push token error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to save push token',
    });
  }
};

const clearPushToken = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUser.uid;

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { $set: { pushToken: '' } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log(`Push token cleared for ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Push token cleared successfully',
    });
  } catch (error) {
    console.error(
      'Clear push token error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to clear push token',
    });
  }
};

const sendTestPush = async (req, res) => {
  try {
    const { userId, title, body } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.pushToken) {
      return res.status(400).json({
        success: false,
        message:
          'This user has not registered a push token yet. They must log in on a real device.',
      });
    }

    const result = await sendPushNotification({
      pushToken: user.pushToken,
      title: title || 'CampusSetu Test Notification',
      body:
        body ||
        `Hello ${user.name}, this is a test push notification from CampusSetu.`,
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message || 'Push notification failed to send',
        error: result.error,
        expoResponse: result.response,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Test notification sent successfully',
      ticketId: result.ticketId,
    });
  } catch (error) {
    console.error('Send test push error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
    });
  }
};

// ==========================================
// ONBOARD / ADD STAFF (ADMIN ACTION)
// ==========================================
const addTeacher = async (req, res) => {
  let createdFirebaseUid = null;
  let createdMongoUserId = null;

  try {
    const { name, email, department, phone, role: requestedRole } = req.body;
    const targetRole = requestedRole === 'teacher' ? 'teacher' : 'staff';
    const firebaseAuth = require('../config/firebaseAdmin');
    const AuditLog = require('../models/AuditLog');
    const brevoService = require('../services/brevoService');

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Staff name is required',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Staff email is required',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanDept =
      typeof department === 'string' ? department.trim() : '';
    const cleanPhone = (phone || '').trim();

    if (!cleanDept) {
      return res.status(400).json({
        success: false,
        message: 'A department is required when inviting staff.',
      });
    }

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      if (existingUser.role === 'staff' || existingUser.role === 'teacher') {
        return res.status(409).json({
          success: false,
          message: 'A staff member with this email already exists.',
        });
      }
      return res.status(409).json({
        success: false,
        message: `An account with this email already exists with role: ${existingUser.role}.`,
      });
    }

    // Check if user already exists in Firebase Auth
    let firebaseUserRecord;
    let isNewFirebaseUser = false;

    try {
      firebaseUserRecord = await firebaseAuth.getUserByEmail(cleanEmail);
      const existingFirebaseInMongo = await User.findOne({ firebaseUid: firebaseUserRecord.uid });
      if (existingFirebaseInMongo) {
        return res.status(409).json({
          success: false,
          message: `This email is already associated with an existing ${existingFirebaseInMongo.role} account.`,
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

    // Set custom user claims for staff role
    await firebaseAuth.setCustomUserClaims(firebaseUserRecord.uid, {
      role: targetRole,
    });

    // Create staff profile in MongoDB
    let newStaff;
    try {
      newStaff = await User.create({
        firebaseUid: firebaseUserRecord.uid,
        email: cleanEmail,
        name: cleanName,
        role: targetRole,
        department: cleanDept,
        phone: cleanPhone,
        isActive: true,
      });
      createdMongoUserId = newStaff._id;
    } catch (mongoErr) {
      if (isNewFirebaseUser && createdFirebaseUid) {
        try {
          await firebaseAuth.deleteUser(createdFirebaseUid);
        } catch (cleanupErr) {
          console.error('Failed to cleanup Firebase user after Mongo error:', cleanupErr.message);
        }
      }
      throw mongoErr;
    }

    // Generate secure Firebase password setup link
    let passwordSetupLink = '';
    try {
      passwordSetupLink = await firebaseAuth.generatePasswordResetLink(cleanEmail);
    } catch (linkErr) {
      console.warn('Could not generate Firebase password reset link:', linkErr.message);
    }

    // Dispatch onboarding email via Brevo
    let emailStatus = { success: false, message: 'Brevo email not sent' };
    if (passwordSetupLink) {
      emailStatus = await brevoService.sendStaffOnboardingEmail({
        toEmail: cleanEmail,
        toName: cleanName,
        role: targetRole,
        department: cleanDept,
        setupPasswordLink: passwordSetupLink,
      });
    }

    // Record audit trail
    await AuditLog.create({
      action: 'ADD_STAFF',
      performedBy: req.user._id,
      targetType: 'user',
      targetId: newStaff._id,
      details: {
        staffEmail: cleanEmail,
        role: targetRole,
        department: cleanDept,
        emailDispatched: emailStatus.success,
        emailMessageId: emailStatus.messageId || null,
        emailError: emailStatus.error || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: emailStatus.success
        ? 'Staff onboarded successfully and onboarding email sent.'
        : 'Staff onboarded successfully. (Note: Email delivery pending or not configured)',
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
      teacher: {
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
    console.error('Add staff error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to onboard staff',
    });
  }
};

// ==========================================
// SECURE BOOTSTRAP FOR FIRST COLLEGE ADMIN
// ==========================================
const bootstrapAdmin = async (req, res) => {
  try {
    const { secretKey } = req.body;
    const expectedKey = process.env.BOOTSTRAP_SECRET || 'CampusSetuAdmin2026Setup';

    if (!secretKey || secretKey !== expectedKey) {
      return res.status(403).json({
        success: false,
        message: 'Invalid administrative bootstrap key',
      });
    }

    req.user.role = 'college_admin';
    await req.user.save();

    const firebaseAuth = require('../config/firebaseAdmin');
    await firebaseAuth.setCustomUserClaims(req.user.firebaseUid, {
      role: 'college_admin',
    });

    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      action: 'BOOTSTRAP_ADMIN',
      performedBy: req.user._id,
      targetType: 'user',
      targetId: req.user._id,
      details: {
        email: req.user.email,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Account successfully upgraded to College Administrator.',
      user: req.user,
    });
  } catch (error) {
    console.error('Bootstrap admin error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to bootstrap administrator',
    });
  }
};

// ==========================================
// DELETE STAFF (ADMIN ACTION)
// ==========================================
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseAuth = require('../config/firebaseAdmin');
    const AuditLog = require('../models/AuditLog');
    const Issue = require('../models/Issue');

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff ID format',
      });
    }

    const staff = await User.findOne({ _id: id, role: { $in: ['staff', 'teacher'] } });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found',
      });
    }

    // Unassign pending/assigned/in_progress complaints from this staff member
    await Issue.updateMany(
      { assignedTo: staff._id, status: { $in: ['assigned', 'in_progress'] } },
      {
        $set: { assignedTo: null, status: 'pending' },
        $push: {
          history: {
            status: 'pending',
            note: `Automatically unassigned: staff account (${staff.name}) was removed by administration.`,
            changedBy: req.user._id,
            changedAt: new Date(),
          },
        },
      }
    );

    if (staff.firebaseUid) {
      try {
        await firebaseAuth.deleteUser(staff.firebaseUid);
      } catch (fbErr) {
        console.warn(`Could not delete Firebase user (${staff.firebaseUid}):`, fbErr.message);
      }
    }

    await User.findByIdAndDelete(staff._id);

    await AuditLog.create({
      action: 'DELETE_STAFF',
      performedBy: req.user._id,
      targetType: 'user',
      targetId: staff._id,
      details: {
        staffName: staff.name,
        staffEmail: staff.email,
        department: staff.department,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Staff member ${staff.name} has been removed successfully.`,
      deletedStaffId: staff._id,
      deletedTeacherId: staff._id,
    });
  } catch (error) {
    console.error('Delete staff error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete staff member',
    });
  }
};

module.exports = {
  getCurrentUser,
  createOrUpdateProfile,
  savePushToken,
  clearPushToken,
  sendTestPush,
  addTeacher,
  addStaff: addTeacher,
  deleteTeacher,
  deleteStaff: deleteTeacher,
  bootstrapAdmin,
};
