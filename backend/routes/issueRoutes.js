const express = require('express');

const authenticateUser =
  require('../middleware/authMiddleware');

const {
  createIssue,
  getMyIssues,
  getIssueById,
} = require('../controllers/issueController');

const router =
  express.Router();


/*
 * CREATE NEW ISSUE
 *
 * POST /api/issues
 */
router.post(
  '/',
  authenticateUser,
  createIssue
);


/*
 * GET CURRENT USER'S ISSUES
 *
 * GET /api/issues/my
 *
 * IMPORTANT:
 * Keep this BEFORE /:id.
 */
router.get(
  '/my',
  authenticateUser,
  getMyIssues
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