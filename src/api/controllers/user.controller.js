const db = require('../../config/db');

// This is an admin-only function
exports.getAllUsers = async (req, res) => {
  try {
    // Select all users but exclude the password hash for security
    const [users] = await db.query('SELECT id, email, role, created_at FROM users');
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'An error occurred while fetching users.' });
  }
};

