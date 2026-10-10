const User = require('../models/User');

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
    } else {
      user.name = trimmedName;

      user.usn =
        normalizedUsn;

      user.phone =
        phone?.trim() || '';

      user.department =
        department?.trim() || '';

      if (req.firebaseUser.email) {
        user.email =
          req.firebaseUser.email;
      }

      await user.save();
    }

    return res.status(200).json({
      success: true,
      message:
        'Profile saved successfully',
      user: user.toObject(),
    });
  } catch (error) {
    console.error(
      'Create/update profile error:',
      error.message
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          'This USN is already registered.',
      });
    }

    return res.status(500).json({
      success: false,
      message:
        'Failed to save profile',
    });
  }
};

// ==========================================
// SAVE / UPDATE PUSH TOKEN
// ==========================================

const savePushToken = async (
  req,
  res
) => {
  try {
    const firebaseUid =
      req.firebaseUser.uid;

    const { pushToken } =
      req.body;

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (
      !pushToken ||
      typeof pushToken !== 'string' ||
      !pushToken.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Push token is required',
      });
    }

    const normalizedToken =
      pushToken.trim();

    // ----------------------------------------
    // FIND AUTHENTICATED USER
    // ----------------------------------------

    const user =
      await User.findOne({
        firebaseUid,
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'User profile not found',
      });
    }

    // ----------------------------------------
    // SAVE TOKEN
    // ----------------------------------------

    user.pushToken =
      normalizedToken;

    await user.save();

    console.log(
      `Push token saved for user: ${firebaseUid}`
    );

    return res.status(200).json({
      success: true,
      message:
        'Push token saved successfully',
    });
  } catch (error) {
    console.error(
      'Save push token error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to save push token',
    });
  }
};

// ==========================================
// ONBOARD / ADD TEACHER (ADMIN ACTION)
// ==========================================
const addTeacher = async (req, res) => {
  try {
    const { name, email, department, phone, password } = req.body;
    const firebaseAuth = require('../config/firebaseAdmin');
    const AuditLog = require('../models/AuditLog');

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Teacher name is required',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Teacher email is required',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanDept = (department || '').trim();
    const cleanPhone = (phone || '').trim();

    // Check if user already exists in MongoDB
    let existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      if (existingUser.role === 'teacher') {
        return res.status(409).json({
          success: false,
          message: 'A teacher with this email already exists.',
        });
      }
      return res.status(409).json({
        success: false,
        message: `An account with this email already exists with role: ${existingUser.role}.`,
      });
    }

    // Provision or verify Firebase user
    let firebaseUserRecord;
    try {
      firebaseUserRecord = await firebaseAuth.getUserByEmail(cleanEmail);
    } catch (fbErr) {
      if (fbErr.code === 'auth/user-not-found') {
        // Create user in Firebase Auth with a temporary or specified password
        const initialPassword = password || `Teach#${Math.random().toString(36).slice(-8)}!`;
        firebaseUserRecord = await firebaseAuth.createUser({
          email: cleanEmail,
          emailVerified: true,
          password: initialPassword,
          displayName: cleanName,
        });
      } else {
        throw fbErr;
      }
    }

    // Set custom user claims for teacher role
    await firebaseAuth.setCustomUserClaims(firebaseUserRecord.uid, {
      role: 'teacher',
    });

    // Create teacher in MongoDB
    const newTeacher = await User.create({
      firebaseUid: firebaseUserRecord.uid,
      email: cleanEmail,
      name: cleanName,
      role: 'teacher',
      department: cleanDept,
      phone: cleanPhone,
      isActive: true,
    });

    // Record audit trail
    await AuditLog.create({
      action: 'ADD_TEACHER',
      performedBy: req.user._id,
      targetType: 'user',
      targetId: newTeacher._id,
      details: {
        teacherEmail: cleanEmail,
        department: cleanDept,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Teacher onboarded successfully',
      teacher: {
        _id: newTeacher._id,
        name: newTeacher.name,
        email: newTeacher.email,
        department: newTeacher.department,
        phone: newTeacher.phone,
        isActive: newTeacher.isActive,
      },
    });
  } catch (error) {
    console.error('Add teacher error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to onboard teacher',
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

    // Upgrade authenticated caller to college_admin
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

module.exports = {
  getCurrentUser,
  createOrUpdateProfile,
  savePushToken,
  addTeacher,
  bootstrapAdmin,
};