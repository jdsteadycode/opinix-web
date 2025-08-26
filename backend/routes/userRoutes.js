const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// set the methods
router.get('/me', userController.me);

// export the router
module.exports = router;
