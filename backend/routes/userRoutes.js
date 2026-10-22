const express = require('express');

const authenticateUser = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

const {
  getCurrentUser,
  createOrUpdateProfile,
  savePushToken,
  clearPushToken,
  sendTestPush,
  addTeacher,
  deleteTeacher,
  bootstrapAdmin,
} = require('../controllers/userController');

const router = express.Router();

router.get('/me', authenticateUser, getCurrentUser);

router.post(
  '/profile',
  authenticateUser,
  createOrUpdateProfile
);

router.put(
  '/profile',
  authenticateUser,
  createOrUpdateProfile
);

// Push token management
router.post(
  '/push-token',
  authenticateUser,
  savePushToken
);

router.post(
  '/push-token/clear',
  authenticateUser,
  clearPushToken
);

router.post(
  '/push-token/test',
  authenticateUser,
  requireRole('college_admin', 'principal'),
  sendTestPush
);

// ==========================================
// ONBOARD STAFF (ADMIN ACTION)
// ==========================================

router.post(
  '/staff',
  authenticateUser,
  requireRole('college_admin', 'principal'),
  addTeacher
);

router.post(
  '/teachers',
  authenticateUser,
  requireRole('college_admin', 'principal'),
  addTeacher
);

// ==========================================
// DELETE STAFF (ADMIN ACTION)
// ==========================================

router.delete(
  '/staff/:id',
  authenticateUser,
  requireRole('college_admin', 'principal'),
  deleteTeacher
);

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
