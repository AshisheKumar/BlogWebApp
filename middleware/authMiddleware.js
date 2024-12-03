const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    
    const token = req.cookies.token || null;

    if (!token) {
      
      if (req.xhr || req.accepts('json')) {
        
        return res.status(401).send('<h1>Please Login or Register</h1>');    
      }
            
      return res.redirect('/api/auth/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    
    if (req.xhr || req.accepts('json')) {
      return res.status(401).send('<h1>Please Login or Register</h1>');
    }
    
    res.redirect('/api/auth/login');
  }
};

module.exports = authMiddleware;
