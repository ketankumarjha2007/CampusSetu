const express = require('express');

const authenticateUser = require('../middleware/authMiddleware');

const {
  getCurrentUser,
  createOrUpdateProfile,
} = require('../controllers/userController');

const router = express.Router();


// GET CURRENT USER
router.get(
  '/me',
  authenticateUser,
  getCurrentUser
);


// CREATE / UPDATE STUDENT PROFILE
router.post(
  '/profile',
  authenticateUser,
  createOrUpdateProfile
);


module.exports = router;