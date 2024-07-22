const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

router.post('/signup', authController.authSignUp);

router.post('/login', authController.authSignIn);

router.post('/verifyOtp', authController.authVerifyOtp);

router.post('/resentOtp', authController.authSignUp);

router.post('/sendMail', authController.sendEmail);

router.post('/admin', authController.authAdminSignIn);

module.exports = router;
