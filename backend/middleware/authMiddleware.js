const firebaseAuth = require('../config/firebaseAdmin');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    const decodedToken = await firebaseAuth.verifyIdToken(idToken);

    req.firebaseUser = decodedToken;

    // Find the corresponding MongoDB user
    let user = await User.findOne({
      firebaseUid: decodedToken.uid,
    });

    // Create the initial profile if it does not exist
    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || '',
        name:
          decodedToken.name ||
          decodedToken.email?.split('@')[0] ||
          'CampusSetu User',
        role: 'student',
      });

      console.log(
        `New CampusSetu user created: ${user.email}`
      );
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      'Firebase authentication error:',
      error.message
    );

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    });
  }
};

module.exports = authenticateUser;