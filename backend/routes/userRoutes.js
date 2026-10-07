const express = require('express');

const authenticateUser = require('../middleware/authMiddleware');
const { getCurrentUser } = require('../controllers/userController');

const router = express.Router();

router.get('/me', authenticateUser, getCurrentUser);

module.exports = router;