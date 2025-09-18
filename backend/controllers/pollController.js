// grab modules
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// poll-creation function
exports.createPoll = async (request, response) => {

    // establish a new connection
    const connection = await pool.getConnection();

    // safe 
    try {

        // A new activity
        await connection.beginTransaction();

        // destructure the incoming poll-data
        const { title, description, user_id, category_name, poll_type, allow_comments, max_choices, expires_at, options, tags } = request.body;

        // check log**
        // console.log(title, description, user_id, category_name, poll_type, allow_comments, max_choices, expires_at, options, tags);
        // console.log(request.body);
        // console.log(request.files);

        // Fetch the existing cateogry if possible or make one!
        let [category] = await connection.query(
            'SELECT id FROM poll_category WHERE name = ?',
            [category_name]
        );

        // initial category-id
        let categoryId = null;

        // when category exists?
        if (category.length > 0) {

            // update the id!
            categoryId = category[0].id;
        }
        // otherwise,
        else if (category_name) {

            // add the new-category into the relation `poll_category`
            let [result] = await connection.query(
                'INSERT INTO poll_category (name) VALUES (?)',
                [category_name]
            );

            // update the id!
            categoryId = result.insertId;
        }

        // check log**
        console.log(`CATEGORY ID: ${categoryId}`);

        // a new poll
        let [pollOutcome] = await connection.query(
            `INSERT INTO polls
            (title, description, user_id, category_id, poll_type, allow_comments, max_choices, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [title, description, user_id, categoryId, poll_type, allow_comments ?? 1, max_choices ?? 5, expires_at]
        );

        // grab the poll-id after successfull save!
        const pollId = pollOutcome.insertId;


        // Assign the poll-options to respective poll_id!
        for(let i = 0; i < options.length; i ++) {
            // save the options one by one to resp. poll created
            let [optionsOutcome] = await connection.query(
                'INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)',
                [pollId, options[i].text]
            );

            // grab the option_id after successfull insertion
            let optionId = optionsOutcome.insertId;

            // grab the file for this option if provided!
            const fileOption  = request.files.find(
                file => file.fieldname === `options[${i}][file]`
            );

            // check
            if(fileOption) {

                // save the file with respect to the option_id
                await connection.query(
                    'INSERT INTO media (option_id, media_url, media_type) VALUES (?, ?, ?)',
                    [
                        optionId, 
                        `/uploads/${fileOption.filename}`, 
                        `${fileOption.mimetype.slice(0, fileOption.mimetype.indexOf("/")).toUpperCase()}`
                    ]
                );
            }
        }

        // check for tags!
        if(tags && tags.length > 0) {

            // iterate over the provided tags
            for(let name of tags) {

                // find the tag if already exists?
                let [tagRows] = await connection.query(
                    'SELECT id FROM tags WHERE name = ?',
                    [name]
                );

                // initial tagId
                let tagId;

                // check for the tag-row
                if(tagRows.length > 0) {

                    // assign the tag-id
                    tagId = tagRows[0].id;
                }

                // otherwise, when no tag data found!
                else {

                    // a the new one!
                    let [newTag] = await connection.query(
                        'INSERT INTO tags (name) VALUES (?)',
                        [name]
                    );

                    // save the tagId 
                    tagId = newTag.insertId;
                }

                // reference the tags -> poll created! via `poll_tags`
                await connection.query(
                    'INSERT INTO poll_tags (poll_id, tag_id) VALUES (?, ?)',
                    [pollId, tagId]
                );
            }
        }

        // save the changes
        await connection.commit();

        // send the response to the Frontend/ Client
        response.status(201).json({
            "message": `Poll was created successfully!`,
            "pollId": pollId,
        });
    }

    // handle run-time issues
    catch (error) {

        // revert the changes
        await connection.rollback();

        // show error
        console.error(error);

        // send http response to frontend
        response.status(500).json({ "message": "Poll Creation Failed!" })
    }

    // clean the memory
    finally {
        // close the connection.
        connection.release();
    }
}

// polls function 
exports.allPolls = async (request, response) => {

    // safe
    try {

        // grab all the polls
        let [polls] = await pool.query(
            `
                SELECT polls.*, users.username, poll_category.name AS category, GROUP_CONCAT(tags.name) AS tags 
                FROM polls
                INNER JOIN users ON (users.id = polls.user_id)
                LEFT JOIN poll_category ON (poll_category.id = polls.category_id)
                LEFT JOIN poll_tags ON (poll_tags.poll_id = polls.id)
                LEFT JOIN tags ON (tags.id = poll_tags.tag_id)
                GROUP BY polls.id
                ORDER BY polls.created_at DESC;
            `
        );

        // check log**
        console.log(polls);

        // update the poll-tags i.e., send poll-tags as array instead of string!
        polls = polls.map(function(poll, index, polls) {
            return {
                ...poll,
                tags: poll.tags ? poll.tags.split(",") : []
            };
        })

        // send the polls-data to Frontend/ Client
        response.json(polls);

    }
    catch(error) {

        // show error
        console.error(error);

        // send http response to frontend
        response.status(500).json({ "message": "Polls fetch failed!" })
    }

}


// polls function 
exports.singlePoll = async (request, response) => {

    // safe
    try {

        // grab the incoming-poll_id from url?
        const { id } = request.params;

        // grab the respective poll via its id!
        let [poll] = await pool.query(
            `
                SELECT polls.*, users.username, poll_category.name AS category, GROUP_CONCAT(tags.name) AS tags
                FROM polls
                INNER JOIN users ON (users.id = polls.user_id)
                LEFT JOIN poll_category ON (poll_category.id = polls.category_id)
                LEFT JOIN poll_tags ON (poll_tags.poll_id = polls.id)
                LEFT JOIN tags ON (tags.id = poll_tags.tag_id)
                WHERE polls.id = ?;
            `,
            [id]
        );

        // when no poll found?
        if(poll[0]?.id == null) return response.status(404).json({"message": "OOPS! Poll ain't found!"});


        // retrive the poll-data
        poll = poll[0];

        // sanitize the tags related to it!
        poll.tags = poll.tags ? poll.tags.split(",") : [];

        // grab the options as well media (IF EXISTS) related to the poll!
        let [pollOptions] = await pool.query(
            `
                SELECT poll_options.id, poll_options.option_text, media.media_url, media.media_type
                FROM poll_options
                LEFT JOIN media ON (poll_options.id = media.option_id)
                WHERE poll_options.poll_id = ?
                ORDER BY poll_options.id ASC;
            `,
            [poll.id]
        );

        // check log**
        // console.log(pollOptions);

        // attach the incoming poll_options to poll-data
        poll.options = pollOptions.map(function(option, index, pollOptions) {

            // each option-details
            return {
                "id": option.id,
                "text": option.option_text,
                "media": option.media_url ? {
                    "url": option.media_url,
                    "type": option.media_type,
                } : null
            }
        });

        // check log**
        console.log(poll);

        // send the polls-data to Frontend/ Client
        response.json(poll);

    }
    // handle run-time error
    catch(error) {

        // show error
        console.error(error);

        // send http response to frontend
        response.status(500).json({ "message": "Polls fetch failed!" })
    }

}


// poll stats
exports.fetchPollStats = async (request, response) => {

    // safe
    try {
        // grab the poll-id!
        const { id } = request.body; 
        
        // check log**
        // console.log(id);

        // grab poll stats
        let [pollResult] = await pool.query(
            `   
                SELECT poll_options.id AS option_id, poll_options.option_text, COUNT(vote_choices.id) AS votes_count
                FROM poll_options
                LEFT JOIN vote_choices ON (poll_options.id = vote_choices.option_id)
                LEFT JOIN votes ON (vote_choices.vote_id = votes.id)
                WHERE poll_options.poll_id = ?
                GROUP BY poll_options.id, poll_options.option_text
                ORDER BY poll_options.id ASC;
            `,
            [id]
        );

        // check log**
        console.log(pollResult);

        // set the total votes 
        const totalVotes = pollResult.reduce((sum, option) => sum += option.votes_count, 0);

        // set vote-result
        const voteSummary = pollResult.map((option) => ({
            "option_text": option.option_text,
            "votes_count": option.votes_count,
        }));

        // send the polls-data to Frontend/ Client
        response.json({
            totalVotes,
            voteSummary
        });

    }
    catch(error) {

        // show error
        console.error(error);

        // send http response to frontend
        response.status(500).json({ "message": "Poll-stats fetch failed!" })
    }

}
