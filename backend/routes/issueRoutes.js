const express = require('express');

const authenticateUser = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  createIssue,
  getMyIssues,
  getIssueById,
  deleteIssue,
  trackIssueByComplaintId,
} = require('../controllers/issueController');

const router = express.Router();


// ==========================================
// CREATE NEW COMPLAINT
// ==========================================
// Supports:
// - Text fields
// - Optional complaint photo
//
// Request flow:
// Firebase Auth
//      ↓
// authenticateUser
//      ↓
// upload.single('photo')
//      ↓
// createIssue
//
router.post(
  '/',
  authenticateUser,
  upload.single('photo'),
  createIssue
);


// ==========================================
// GET MY COMPLAINTS
// ==========================================

router.get(
  '/my',
  authenticateUser,
  getMyIssues
);


// ==========================================
// TRACK COMPLAINT BY COMPLAINT ID
// ==========================================

router.get(
  '/track/:complaintId',
  authenticateUser,
  trackIssueByComplaintId
);


// ==========================================
// DELETE COMPLAINT
// ==========================================

router.delete(
  '/:id',
  authenticateUser,
  deleteIssue
);


// ==========================================
// GET SINGLE COMPLAINT
// ==========================================

router.get(
  '/:id',
  authenticateUser,
  getIssueById
);


module.exports = router;