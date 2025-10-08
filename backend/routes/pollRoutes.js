// grab modules
const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController.js');
const upload = require("../middleware/upload.js");
const pollModeration = require('../middleware/pollModeration');

// set the methods
router.post('/create',upload.any(), pollController.createPoll);
router.get('/all', pollController.allPolls);
router.get("/:id", pollController.singlePoll);
router.post("/stats", pollController.fetchPollStats);
router.post("/moderate", pollModeration);

// export the router
module.exports = router;
