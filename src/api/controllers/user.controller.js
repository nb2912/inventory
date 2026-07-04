const db = require('../../config/db');
const bcrypt = require('bcrypt');
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

exports.getUserById = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, email, role, created_at FROM users WHERE id = ?', [req.params.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ status: 'success', data: { user: users[0] } });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: 'An error occurred while fetching the user.' });
  }
};

exports.createUser = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'An error occurred while creating the user.' });
  }
};

exports.updateUser = async (req, res) => {
  const { email, role } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE users SET email = ?, role = ? WHERE id = ?',
      [email, role, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'An error occurred while updating the user.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'An error occurred while deleting the user.' });
  }
};
