const express = require('express');
const router = express.Router();
const { studentSignup, studentLogin, adminLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/student/signup', studentSignup);
router.post('/student/login', studentLogin);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);

module.exports = router;
