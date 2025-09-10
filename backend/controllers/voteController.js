// grab modules
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// cast-vote for a poll function
exports.castVote = async (request, response) => {

    // grab the incoming data**
    const {pollId} = request.params;
    const {selectedOptions, userId} = request.body;

    // ensure authorization!!
    // check for the user-id?
    if(!userId) return response.status(400).json({"message": "Access denied!"});

    // check the incoming options?
    if(!Array.isArray(selectedOptions) || selectedOptions.length == 0) return response.status(400).json({"message": "No options selected!"});

    // safe 
    try {

        // grab the poll?
        const [pollRows] = await pool.query(
            `
                SELECT id, poll_type, max_choices
                FROM polls
                WHERE id = ? AND status = 'active' AND is_active = 1
            `,
            [pollId]
        );

        // when poll doesn't exist!
        if(pollRows.length == 0) return response.status(404).json({"message": "OOPS! No Poll Found OR In-active"});

        // grab the poll-data
        const poll = pollRows[0];

        // check log**
        console.log(poll);

        // handle poll-options selection!!
        if(poll.poll_type === "single" && selectedOptions.length > 1) return response.status(400).json({"message": "Only one option selection is allowed"});

        // for multi poll-type!
        if(poll.poll_type === "multi" && selectedOptions.length > poll.max_choices) return response.status(400).json({"message": `Max ${poll.max_choices} choices only allowed!!`});


        // check if user already voted or not?
        const [votes] = await pool.query(
            `
            SELECT id
            FROM votes
            WHERE user_id = ? AND poll_id = ?
            `,
            [userId, pollId]
        );
        
        // when already voted!
        if(votes.length > 0) return response.status(409).json({"message": "You've already casted your vote!"});


        // save the vote-casting of the user
        const [voteOutcome] = await pool.query(
            `
            INSERT INTO votes
            (poll_id, user_id)
            VALUES
            (?, ?)
            `,
            [pollId, userId]
        );

        // grab the vote-id!
        const voteId = voteOutcome.insertId;

        // if multi-votes then,
        if(poll.poll_type === "multi") {

            // grab the vote_id and option_id in array
            const voteData = selectedOptions.map(optionId => [voteId, optionId]);

            // save them in `vote_choices` RELATION
            await pool.query(
                `
                INSERT INTO vote_choices (vote_id, option_id)
                VALUES ?
                `,
                [voteData]
            );
        }
        // otherwise store the single-vote!
        else {

            // save the voted option to `vote_choices` RELATION
            await pool.query(
                `
                INSERT INTO vote_choices (vote_id, option_id)
                VALUES (?, ?)
                `,
                [voteId, selectedOptions[0]]
            );
        }

        // send the response to the Frontend/ Client
        return response.status(201).json({
            "message": `Your vote has been casted! Thank you.`,
            "pollId": pollId,
            "voteId": voteId,
        });
    }

    // handle run-time issues
    catch (error) {

        // show error
        console.error(error);

        // send http response to frontend
        response.status(500).json({ "message": "Poll vote failed!" });
    }

    // clean the memory
    finally {
        // log the message**
        console.log("Task completed");
    }
}

// checks if already user has casted the vote 
exports.voted = async (request, response) => {

    // grab the incoming data**
    const {userId, pollId} = request.body;

    // ensure authorization!!
    // check for the user-id?
    if(!userId) return response.status(400).json({"message": "Access denied!"});

    // safe 
    try {

        // grab the user's poll castings**
        const [pastCastings] = await pool.execute(
            `
                SELECT id
                FROM votes
                WHERE poll_id = ? AND user_id = ? 
            `,
            [pollId, userId]
        );

        // check if user actually voted!
        if(pastCastings.length > 0) {
           // send the response to the Frontend/ Client
           return response.status(409).json({"message": "You've already casted your vote!", "status": false});
        }
        // otherwise, let user-proceed further
        else {
            // send the response to the Frontend/ Client
            return response.status(202).json({"message": "No vote from your end!", "status": true});
        }
    }

    // handle run-time issues
    catch (error) {

        // show error
        console.error(error);

        // send http response to frontend
        response.status(500).json({ "message": "User Vote Request failed!" });
    }

    // clean the memory
    finally {
        // log the message**
        console.log("Task completed");
    }
}
