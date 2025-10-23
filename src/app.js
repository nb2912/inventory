const express = require('express');
const cors = require('cors');
const session = require('express-session');

// Import your routes
const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/user.routes');
const itemRoutes = require('./api/routes/item.routes'); // <-- 1. Import item routes
const dashboardRoutes = require('./api/routes/dashboard.routes'); // Import dashboard routes
const alertRoutes = require('./api/routes/alert.routes'); // Import alert routes
const categoryRoutes = require('./api/routes/category.routes'); // Import category routes
const barcodeRoutes = require('./api/routes/barcode.routes'); // Import barcode routes
const reportRoutes = require('./api/routes/report.routes'); // Import report routes

// Create the Express app
const app = express();

// --- Middleware ---
// Enable Cross-Origin Resource Sharing
app.use(cors());
// Enable the Express app to parse JSON requests
app.use(express.json());
// Serve static files from both root and public directory
app.use(express.static('./'));
app.use(express.static('src/public'));
// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Add and configure the session middleware
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
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes); // <-- 2. Use the item routes
app.use('/api/dashboard', dashboardRoutes); // Use the dashboard routes
app.use('/api/alerts', alertRoutes); // Use the alert routes
app.use('/api/categories', categoryRoutes); // Use the category routes
app.use('/api/barcodes', barcodeRoutes); // Use the barcode routes
app.use('/api/reports', reportRoutes); // Use the report routes

// Serve the frontend for any other route
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'src/public' });
});


// A simple root route for testing if the server is up
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Inventory Management API!' });
});

// Export the app so server.js can use it
module.exports = app;
