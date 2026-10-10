const express = require('express');

const authenticateUser = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const requireRole = require('../middleware/requireRole');

const {
  createIssue,
  getMyIssues,
  getIssueById,
  deleteIssue,
  trackIssueByComplaintId,
  getTeacherAssignedIssues,
  getAllIssues,
  getActiveTeachers,
  assignIssueToTeacher,
  updateIssueStatus,
} = require('../controllers/issueController');

const router = express.Router();

// Create a new complaint
router.post(
  '/',
  authenticateUser,
  upload.single('photo'),
  createIssue
);

// Get complaints submitted by the logged-in student
router.get(
  '/my',
  authenticateUser,
  getMyIssues
);

// Get complaints assigned to the logged-in teacher
router.get(
  '/teacher/assigned',
  authenticateUser,
  requireRole('teacher'),
  getTeacherAssignedIssues
);

// Track complaint by complaint ID
router.get(
  '/track/:complaintId',
  authenticateUser,
  trackIssueByComplaintId
);

// Get all complaints for authorized college administrators
router.get(
  '/admin/all',
  authenticateUser,
  requireRole('college_admin', 'cluster_head', 'principal'),
  getAllIssues
);

// Get active teachers for the admin dashboard
router.get(
  '/admin/teachers',
  authenticateUser,
  requireRole('college_admin', 'principal'),
  getActiveTeachers
);

// Assign a complaint to an active teacher
router.patch(
  '/:id/assign',
  authenticateUser,
  requireRole('college_admin', 'principal'),
  assignIssueToTeacher
);

// Update complaint status
router.patch(
  '/:id/status',
  authenticateUser,
  requireRole('college_admin', 'principal','teacher'),
  updateIssueStatus
);

// Delete a complaint
router.delete(
  '/:id',
  authenticateUser,
  deleteIssue
);

// Get a single complaint
router.get(
  '/:id',
  authenticateUser,
  getIssueById
);

module.exports = router;