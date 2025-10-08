const express = require('express');
const cors = require('cors');
const session = require('express-session'); // <-- 1. Import express-session

// Import your routes
const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/user.routes'); // <-- 2. Import user routes

// Create the Express app
const app = express();

// --- Middleware ---
// Enable Cross-Origin Resource Sharing
app.use(cors());
// Enable the Express app to parse JSON requests
app.use(express.json());

// 3. Add and configure the session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Secret key to sign the session ID cookie
    resave: false,                      // Don't save session if unmodified
    saveUninitialized: false,           // Don't create session until something is stored
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 1000 * 60 * 60, // Cookie expires in 1 hour
    },
  })
);


// --- Routes ---
// This tells the app that for any URL starting with /api/auth,
// it should use the routes defined in auth.routes.js
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // <-- 4. Use the user routes for admin functionality


// A simple root route for testing if the server is up
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Inventory Management API!' });
});

// Export the app so server.js can use it
module.exports = app;