// grab modules..
const jwt = require("jsonwebtoken");
const { isBlacklisted } = require("../controllers/authController.js");

// () -> verify token
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (isBlacklisted(token)) {
    return res.status(401).json({ message: "Token has been invalidated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // add decoded payload to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
