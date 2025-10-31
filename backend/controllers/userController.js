// grab modules
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// profile module (me)
exports.me = async (req, res) => {

    // check** log
    console.log(req.headers);

    // safe try
    try {

        // handle header
        const header = req.headers["authorization"];

         // check for availability
         if (!header) return res.status(401).json({ message: "No token provided" });

        // extract the bearer token!
        const authToken = header.split(" ")[1];
        
        // check the format
        if (!authToken) return res.status(401).json({ message: "Invalid token format" });

        // verify the token and grab the decoded user
        const decoded = await new Promise((resolve, reject) => {

            // verify the token
            jwt.verify(authToken, process.env.JWT_SECRET, (error, decoded) => {

                // when token is invalid
                if (error) reject(error);

                // resolve the promise
                else resolve(decoded);
            });
        });

        // fire DQL Query
        const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
            [decoded.email]
        );

        // IF NO USER?
        if (rows.length === 0) {

            // throw client toast
            return res.status(400).json({ message: "OOPS user ain't found!" });
        }

        // get the user details
        const user = rows[0];

        // grab the polls user created!
        const [createdPolls] = await pool.query(
            `
            SELECT COUNT(*) AS created_count 
            FROM polls 
            WHERE user_id = ?
            `,
            [user.id]
        );

        // grab the polls voted!
        const [votedPolls] = await pool.query(
            `
            SELECT COUNT(DISTINCT poll_id) AS voted_count
            FROM votes
            WHERE user_id = ?
            `,
            [user.id]
        );

        // grab the total votes on created polls
        const [totalVotes] = await pool.query(
            `
            SELECT COUNT(*) as total_votes
            FROM votes
            INNER JOIN polls ON (votes.poll_id = polls.id)
            WHERE polls.user_id = ?
            `,
            [user.id]
        );

        // when fetch successfull
        res.json({
            message: 'Verfication Passed',
            authToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                nickname: user.nickname,
                bio: user.bio,
                phone: user.phone,
                gender: user.gender,
                birthdate: user.birthdate,
                profileImage: user.profile_image,
                stats: {
                    "createdPolls": createdPolls[0].created_count,
                    "votedPolls": votedPolls[0].voted_count,
                    "totalVotes": totalVotes[0].total_votes,
                }
            }
        });
    }

    // handle run-time error1
    catch(error) {
        return res.status(500).json({"message": "Server Error", "error": error});
    }
}

// () -> update the profile!
exports.updateMe = async (req, res) => {
    // grab the data for update
    const { id, nickname, bio, gender, phone, birthdate} = req.body;
    // console.log(req.file);

    try {
        // check log**
        console.log(id, nickname, bio, phone, gender, birthdate);

        // initial DML command
        let updatedCommand = `
            UPDATE users
            SET nickname = ?, bio = ?, gender = ?, birthdate = ?, phone = ?
        `;

        // initial values
        let params = [nickname, bio, gender, birthdate, phone];

        // when image is available for update
        if (req.file) {
            profileImage = req.file.filename;
            updatedCommand += `, profile_image = ?`;
            params.push(profileImage);
        }

        // attach id for update
        updatedCommand += ` WHERE id = ?`;
        params.push(id);

        // execute the update
        const [updateOutcome] = await pool.query(updatedCommand, params);

        // fetch updated profile
        const [updatedUser] = await pool.query(
            `SELECT id, email, username, nickname, bio, gender, phone, birthdate, profile_image 
             FROM users 
             WHERE id = ?`,
            [id]
        );

        res.json({
            message: "Updated!",
            user: updatedUser[0],
        });
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error });
    }
};

// () -> get all created polls..
exports.getUserPolls = async (req, res) => {
  const { userId } = req.params;

  try {
    // Verify user exists (optional but good practice)
    const [user] = await pool.query(`SELECT id FROM users WHERE id = ?`, [userId]);
    if (user.length === 0)
      return res.status(404).json({ status: false, message: "User not found" });

    // Fetch polls created by this user (include soft-deleted for admin view if needed)
    const [polls] = await pool.query(`
      SELECT 
        id, 
        title, 
        description,
        status,
        is_active,
        created_at,
        updated_at
      FROM polls
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);

    res.json({ status: true, data: polls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Failed to fetch user's polls" });
  }
};

// () -> delete user created poll..pool
exports.deletePoll = async (req, res) => {
  const pollId = req.params.pollId;
  const { userId } = req.body;

  try {
    // 1️⃣ Check if the poll belongs to the user
    const [poll] = await pool.query(
      "SELECT * FROM polls WHERE id=? AND user_id=?",
      [pollId, userId]
    );
    if (!poll) return res.status(404).json({ message: "Poll not found or unauthorized" });

    // 2️⃣ Soft delete the poll by setting is_active = 0
    await pool.query("UPDATE polls SET is_active = 0, status='archived' WHERE id = ?", [pollId]);

    // 3️⃣ Optional: you can also keep votes/poll_options intact or archive them separately if needed

    res.json({ message: "Poll has been archived (soft deleted) successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// () -> get all users (admin-only)
exports.getAllUsers = async (req, res) => {
  try {
    console.log(req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error", error });
  }
};



