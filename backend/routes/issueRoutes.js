const express = require('express');

const authenticateUser = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const requireRole = require('../middleware/requireRole');

const {
  createIssue,
  getIssueDepartments,
  getMyIssues,
  getIssueById,
  deleteIssue,
  trackIssueByComplaintId,
  getTeacherAssignedIssues,
  getTeacherWorkspaceIssues,
  claimIssue,
  getAllIssues,
  getActiveTeachers,
  assignIssueToTeacher,
  updateIssueStatus,
  submitIssueFeedback,
  reopenIssue,
  escalateIssue,
  requestAdditionalInfo,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAuditLogs,
} = require('../controllers/issueController');
const { downloadReport } = require('../controllers/reportController');

const router = express.Router();

// Notifications
router.get('/notifications/me', authenticateUser, getMyNotifications);
router.patch('/notifications/read-all', authenticateUser, markAllNotificationsRead);
router.patch('/notifications/:id/read', authenticateUser, markNotificationRead);

// Audit logs
router.get('/admin/audit-logs', authenticateUser, requireRole('college_admin', 'principal', 'cluster_head'), getAuditLogs);

// PDF exports
router.get(
  '/reports/download',
  authenticateUser,
  requireRole('college_admin', 'principal', 'cluster_head', 'staff', 'teacher'),
  downloadReport
);

// Create a new complaint (Open to everyone: students, staff, cluster head, principal)
router.post(
  '/',
  authenticateUser,
  upload.single('photo'),
  createIssue
);

// Departments accepting complaints (Open to everyone so all roles can report)
router.get(
  '/departments',
  authenticateUser,
  getIssueDepartments
);

// Get complaints submitted by the logged-in user
router.get(
  '/my',
  authenticateUser,
  getMyIssues
);

// Get complaints assigned to the logged-in staff member
router.get(
  '/staff/assigned',
  authenticateUser,
  requireRole('staff', 'teacher'),
  getTeacherAssignedIssues
);

router.get(
  '/teacher/assigned',
  authenticateUser,
  requireRole('staff', 'teacher'),
  getTeacherAssignedIssues
);

router.get(
  '/staff/workspace',
  authenticateUser,
  requireRole('staff', 'teacher'),
  getTeacherWorkspaceIssues
);

router.get(
  '/teacher/workspace',
  authenticateUser,
  requireRole('staff', 'teacher'),
  getTeacherWorkspaceIssues
);

router.post(
  '/:id/claim',
  authenticateUser,
  requireRole('staff', 'teacher'),
  claimIssue
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

// Get active staff for the admin dashboard
router.get(
  '/admin/staff',
  authenticateUser,
  requireRole('college_admin', 'principal', 'cluster_head'),
  getActiveTeachers
);

router.get(
  '/admin/teachers',
  authenticateUser,
  requireRole('college_admin', 'principal', 'cluster_head'),
  getActiveTeachers
);

// Assign a complaint to an active staff member
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
  requireRole('college_admin', 'principal', 'cluster_head', 'staff', 'teacher'),
  upload.single('photo'),
  updateIssueStatus
);

// The reporting user may rate a resolved complaint
router.post(
  '/:id/feedback',
  authenticateUser,
  submitIssueFeedback
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

// Request additional info from reporting user
router.post(
  '/:id/request-info',
  authenticateUser,
  requireRole('staff', 'teacher', 'college_admin', 'principal'),
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
