const db = require('../../config/db');
const bcrypt = require('bcrypt');

// Signup logic
exports.signup = async (req, res) => {
  // Allow role to be passed in the body, defaulting to 'user'
  const { email, password, role = 'user' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [existingUsers] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Include the role in the INSERT statement
    const [result] = await db.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [
      email,
      hashedPassword,
      role,
    ]);

    res.status(201).json({ message: 'User created successfully!', userId: result.insertId });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'An error occurred during the signup process.' });
  }
};

// Login logic
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Create session, including the user's role
    req.session.user = {
      userId: user.id,
      email: user.email,
      role: user.role, // The role is now stored in the session
    };

    res.status(200).json({
      message: 'Logged in successfully!',
      user: req.session.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during the login process.' });
  }
};

// Logout logic
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out, please try again.' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully.' });
  });
};

// Get profile logic
exports.getProfile = (req, res) => {
  // The 'protect' middleware already checked if the user is logged in.
  // We can just send back the user info from the session.
  res.status(200).json({
    message: 'Profile data fetched successfully.',
    user: req.session.user,
  });
};