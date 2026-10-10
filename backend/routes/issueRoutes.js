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
  reopenIssue,
  escalateIssue,
  requestAdditionalInfo,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAuditLogs,
} = require('../controllers/issueController');

const router = express.Router();

// Notifications
router.get('/notifications/me', authenticateUser, getMyNotifications);
router.patch('/notifications/read-all', authenticateUser, markAllNotificationsRead);
router.patch('/notifications/:id/read', authenticateUser, markNotificationRead);

// Audit logs
router.get('/admin/audit-logs', authenticateUser, requireRole('college_admin', 'principal'), getAuditLogs);

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

// Get all complaints for authorized college administrators / cluster heads / principal
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
  requireRole('college_admin', 'principal', 'cluster_head'),
  getActiveTeachers
);

// Assign a complaint to an active teacher
router.patch(
  '/:id/assign',
  authenticateUser,
  requireRole('college_admin', 'principal', 'cluster_head'),
  assignIssueToTeacher
);

// Update complaint status
router.patch(
  '/:id/status',
  authenticateUser,
  requireRole('college_admin', 'principal', 'cluster_head', 'teacher'),
  updateIssueStatus
);

// Reopen complaint
router.post(
  '/:id/reopen',
  authenticateUser,
  reopenIssue
);

// Escalate complaint
router.post(
  '/:id/escalate',
  authenticateUser,
  requireRole('college_admin', 'principal', 'cluster_head'),
  escalateIssue
);

// Request additional info from student
router.post(
  '/:id/request-info',
  authenticateUser,
  requireRole('teacher', 'college_admin', 'principal'),
  requestAdditionalInfo
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