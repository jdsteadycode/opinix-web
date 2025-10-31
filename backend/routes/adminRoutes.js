const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController.js');
const upload = require('../middleware/upload');
const verifyUser = require("../middleware/VerifyUser.js");

// set the methods
router.get("/all", verifyUser, adminController.getAllUsers);
router.delete("/delete/:userId", verifyUser, adminController.deleteUser);

// export the router
module.exports = router;
