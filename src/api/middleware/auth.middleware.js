// Middleware to check if a user is logged in via session (authentication)
exports.protect = (req, res, next) => {
  // Check if the user object exists on the session
  if (req.session.user) {
    // If logged in, attach user to the request object for other middleware/controllers to use
    req.user = req.session.user;
    next(); // The user is authenticated, proceed to the next function
  } else {
    res.status(401).json({ message: 'Not authorized, please log in.' });
  }
};

// Middleware to check for a specific role (authorization)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // 'roles' is an array of allowed roles, e.g., ['admin']
    // req.user.role was set by the 'protect' middleware above
    if (!roles.includes(req.user.role)) {
      // If the user's role is not in the list of allowed roles, deny access
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next(); // The user has the required role, proceed
  };
};

