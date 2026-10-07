const express = require('express');

const authenticateUser = require('../middleware/authMiddleware');

const {
  createIssue,
  getMyIssues,
  getIssueById,
  deleteIssue,
  trackIssueByComplaintId,
} = require('../controllers/issueController');

const router = express.Router();


/*
 * CREATE ISSUE
 *
 * POST /api/issues
 */
router.post(
  '/',
  authenticateUser,
  createIssue
);


/*
 * GET MY ISSUES
 *
 * GET /api/issues/my
 */
router.get(
  '/my',
  authenticateUser,
  getMyIssues
);
router.get(
  '/track/:complaintId',
  authenticateUser,
  trackIssueByComplaintId
);

/*
 * DELETE ISSUE
 *
 * DELETE /api/issues/:id
 *
 * Must come before /:id.
 */
router.delete(
  '/:id',
  authenticateUser,
  deleteIssue
);


/*
 * GET SINGLE ISSUE
 *
 * GET /api/issues/:id
 */
router.get(
  '/:id',
  authenticateUser,
  getIssueById
);


module.exports = router;