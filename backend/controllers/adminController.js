// grab modules
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');


// () -> get all users (admin-only)
exports.getAllUsers = async (req, res) => {
  try {
    // 🔒 Check if the logged-in user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ status: false, message: "Access denied. Admins only." });
    }

    // ✅ Fetch all active users (soft-deleted users excluded)
    const [users] = await pool.query(
      "SELECT id, username, email, role, nickname, bio, gender, profile_image, is_active  FROM users"
    );

    res.status(200).json({ status: true, users });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ status: false, message: "Server error", error });
  }
};

// () -> delete (soft delete) user account
exports.deleteUser = async (req, res) => {
  const userId = req.params.userId; // the ID of the user to delete

  try {
    // 🔒 Only admins can delete users
    if (req.user.role !== "admin") {
      return res.status(403).json({ status: false, message: "Access denied. Admins only." });
    }

    // ✅ Check if user exists and is active
    const [user] = await pool.query("SELECT * FROM users WHERE id = ? AND is_active = 1", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ status: false, message: "User not found or already deleted." });
    }

    // ✅ Soft delete user
    await pool.query("UPDATE users SET is_active = 0 WHERE id = ?", [userId]);

    res.status(200).json({ status: true, message: "User deleted (soft delete successful)." });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ status: false, message: "Server error", error });
  }
};
