// grab modules
const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController.js');

// set the method(s)
router.post("/:pollId/cast", voteController.castVote);
router.post("/check", voteController.voted);

// export the router
module.exports = router;
