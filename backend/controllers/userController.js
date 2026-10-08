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

module.exports = {
  getCurrentUser,
  createOrUpdateProfile,
  savePushToken,
};