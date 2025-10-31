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
router.get("/voted/:userId", pollController.fetchVotedPolls);
router.post("/report", pollController.reportPoll);
router.delete("/admin/delete/:pollId", pollController.deleteReportedPoll);
router.get("/admin/reported-polls", pollController.getReportedPolls);
router.post("/admin/dismiss/:pollId", pollController.dismissReport);
router.patch("/admin/restore/:pollId", pollController.restorePoll);

// export the router
module.exports = router;
