const User = require('../models/User');

const getCurrentUser = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUser.uid;

    const user = await User.findOne({ firebaseUid }).select('-__v');

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
    console.error('Get current user error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
    });
  }
};

module.exports = {
  getCurrentUser,
};