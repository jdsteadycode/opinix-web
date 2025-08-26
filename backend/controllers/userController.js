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
        // FIRE DQL QUERY 
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
            }
        });
    }

    // handle run-time error1
    catch(error) {
        return res.status(500).json({"message": "Server Error"});
    }
}
