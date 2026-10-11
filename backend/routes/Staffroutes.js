const express = require('express');

const authenticateUser = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

const {
  listStaff,
  inviteStaff,
  resendInvite,
  removeStaff,
} = require('../controllers/staffController');

const router = express.Router();

// Teachers, cluster heads and principals
router.get(
  '/',
  authenticateUser,
  requireRole('college_admin', 'principal'),
  listStaff
);

// Invite a new team member (creates the account + emails the invite)
router.post(
  '/',
  authenticateUser,
  requireRole('college_admin', 'principal'),
  inviteStaff
);

// Send the set-password email again
router.post(
  '/:id/resend-invite',
  authenticateUser,
  requireRole('college_admin', 'principal'),
  resendInvite
);

// Remove a team member
router.delete(
  '/:id',
  authenticateUser,
  requireRole('college_admin', 'principal'),
  removeStaff
);

module.exports = router;