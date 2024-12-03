const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Retrieve the token from the cookies
    const token = req.cookies.token || null;

    if (!token) {
      // For EJS views, redirect to login page if no token is found
      if (req.xhr || req.accepts('json')) {
        // Return an error for API requests (AJAX)
        return res.status(401).send('<h1>Please Login or Register</h1>');//return res.status(401).send({ error: 'Please authenticate.' });    
      }
      
      // For normal requests (views), you can render the login page or redirect
      return res.redirect('/api/auth/login');
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user associated with the decoded token
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    // Attach user and token to the request object
    req.token = token;
    req.user = user;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // If token is invalid or user doesn't exist, respond with an error or redirect
    if (req.xhr || req.accepts('json')) {
      return res.status(401).send('<h1>Please Login or Register</h1>');//return res.status(401).send({ error: 'Please authenticate.' });
    }
    
    // Redirect to login page for non-API routes
    res.redirect('/api/auth/login');
  }
};

module.exports = authMiddleware;
