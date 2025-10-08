// grab modules
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// register module
exports.register = async (req, res) => {
  try {
    // log** details
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    // get the client-data from form-body
    const { email, username, nickname, bio, phone, password, confirmPassword, gender, birthdate } = req.body;

    // initial profile-image
    let profileImage = null;

    // check for the file?
    if (req.file) {

      // if so then get the file via body
      profileImage = req.file.filename;
    }

    // when password doesn't match*
    if (password !== confirmPassword) {

      // throw error toast
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // check if same user?
    const [existingUser] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    // when same user-found 
    if (existingUser.length > 0) {

      // restrict new registration
      return res.status(400).json({ message: 'User already exists' });
    }

    // mask the pasword for security**
    const hashedPassword = await bcrypt.hash(password, 10);

    // FIRE DML COMMAND
    // ensured `null` values even if data doesn't completely come...
    await pool.execute(
      `INSERT INTO users (email, username, nickname, bio, phone, password_hash, gender, birthdate, profile_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, username, nickname || username, bio || null, phone || null, hashedPassword, gender || null, birthdate || null, profileImage]
    );


    // when successfull
    res.status(201).json({ message: `${username} just got registered`, status: true });

  }
  
  // throw error-toast to client
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// login module
exports.login = async (req, res) => {
  try {
  
    // get the client-credentials from form-body
    const { email, password } = req.body;
    console.log(`BODY: ${email} ${password}`);
  
    
    // FIRE DQL QUERY 
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    // IF NO USER?
    if (rows.length === 0) {

      // throw client toast
      return res.status(400).json({ message: "OOPS user ain't found!" });
    }

    // get the user-data
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);    // cross-check the passwords

    // when passwords didn't match
    if (!isMatch) {

      // throw toast
      return res.status(400).json({ message: "INVALID E-MAIL OR PASSWORD" });
    }

    // create secure-token for authenticated user
    // and send it with user...
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '27d' }
    );

    // when user-auth successfull
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      }
    });
      
  }
  // throw toast when error occurs
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// In-memory blacklist (clears on server restart)
const blacklistedTokens = new Set();  

// logout module
exports.logout = (req, res) => {
  // get token
  const authHeader = req.headers.authorization;

  // check if token is present or not?
  if (!authHeader) {
    return res.status(400).json({ message: "No token provided" });
  }

  // grab token
  const token = authHeader.split(" ")[1];
  blacklistedTokens.add(token);      // add token to blacklist

  // send response to client
  res.json({ message: "Logout successful" });
};

// Export a helper to check if token is blacklisted
exports.isBlacklisted = (token) => blacklistedTokens.has(token);

