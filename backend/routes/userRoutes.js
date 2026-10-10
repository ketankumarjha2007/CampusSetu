const express = require('express');

const authenticateUser =
  require('../middleware/authMiddleware');

const {
  getCurrentUser,
  createOrUpdateProfile,
  savePushToken,
  addTeacher,
  deleteTeacher,
  bootstrapAdmin,
} = require('../controllers/userController');

const requireRole = require('../middleware/requireRole');

const router = express.Router();

// ==========================================
// GET CURRENT USER
// ==========================================

router.get(
  '/me',
  authenticateUser,
  getCurrentUser
);

// ==========================================
// CREATE / UPDATE STUDENT PROFILE
// ==========================================

router.post(
  '/profile',
  authenticateUser,
  createOrUpdateProfile
);

// ==========================================
// SAVE / UPDATE PUSH TOKEN
// ==========================================

router.post(
  '/push-token',
  authenticateUser,
  savePushToken
);

// ==========================================
// ONBOARD TEACHER (ADMIN ACTION)
// ==========================================

router.post(
  '/teachers',
  authenticateUser,
  requireRole('college_admin', 'principal'),
  addTeacher
);

// ==========================================
// DELETE TEACHER (ADMIN ACTION)
// ==========================================

router.delete(
  '/teachers/:id',
  authenticateUser,
  requireRole('college_admin', 'principal'),
  deleteTeacher
);

// ==========================================
// SECURE BOOTSTRAP INITIAL ADMIN
// ==========================================

router.post(
  '/bootstrap-admin',
  authenticateUser,
  bootstrapAdmin
);

module.exports = router;