const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');

// set the methods
router.get('/me', userController.me);
// router.patch('/me/update', userController.updateMe);
router.patch('/me/update', upload.single('profileImage'), userController.updateMe);
router.get("/me/:userId/my-polls", userController.getUserPolls);
router.delete("/me/delete-poll/:pollId", userController.deletePoll);


// export the router
module.exports = router;
