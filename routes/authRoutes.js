const express = require('express')
const router = express.Router();
const {register, verifyEmail, login, logout, forgetPassword, resetPassword} = require('../controllers/authController');
const {authenticateUser} = require('../middleware/authentication')


router.post('/register', register)
router.post('/login', login)
router.get('/logout', authenticateUser, logout)
router.post('/verify-email', verifyEmail)
router.post('/forgot-password', forgetPassword);
router.post('/reset-password', resetPassword);

module.exports = router;