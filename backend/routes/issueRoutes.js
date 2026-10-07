const express = require('express');

const authenticateUser = require('../middleware/authMiddleware');

const {
  createIssue,
  getMyIssues,
} = require('../controllers/issueController');

const router = express.Router();

router.post(
  '/',
  authenticateUser,
  createIssue
);

router.get(
  '/my',
  authenticateUser,
  getMyIssues
);

module.exports = router;