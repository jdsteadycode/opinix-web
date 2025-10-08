const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');
const verifyUser = require("../middleware/verifyUser");

router.post('/register', upload.single('profileImage'), authController.register);
// router.post('/register', authController.register)
router.post('/login', authController.login);
router.post('/logout', verifyUser, authController.logout);

module.exports = router;
