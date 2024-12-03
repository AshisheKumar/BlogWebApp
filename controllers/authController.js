const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user'
    });
    
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '.5h' }
    );

    res.redirect('/api/auth/login');

    res.status(201);   //.json({ token, userId: user._id, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    // Check if the user is already logged in by checking the cookie
    const tokan = req.cookies.token;
    if (tokan) {
      // If the token exists, verify it
      try {
        const decoded = jwt.verify(tokan, process.env.JWT_SECRET);
        // If the token is valid, redirect the user based on their role
        const user = await User.findById(decoded.userId);
        if (user) {
          // Inform the user that they are already logged in
          return res.status(400).json({ message: 'You are already logged in' });
        }
      } catch (err) {
        console.error('Token verification error:', err);
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
    }

    // If no valid token exists, proceed with normal login process
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set JWT token in the cookie
    res.cookie('token', token, {
      httpOnly: true,  // Prevent JavaScript access to the cookie (for security)
      sameSite: 'Strict', // Helps prevent CSRF attacks
      // Uncomment the line below in production if using HTTPS
      // secure: process.env.NODE_ENV === 'production'
    });
    res.cookie('role', user.role, {
      httpOnly: true,  // Prevent JavaScript access to the cookie (for security)
      sameSite: 'Strict', // Helps prevent CSRF attacks
      // Uncomment the line below in production if using HTTPS
      // secure: process.env.NODE_ENV === 'production'
    });
    // Redirect based on user role
    if (user.role === 'admin') {
      return res.redirect('/api/posts/admin');
    } else {
      return res.redirect('/api/posts');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.logout = (req, res) => {
  try {
    // Clear the cookies for token and role
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'Strict',
      // Uncomment the line below in production if using HTTPS
      // secure: process.env.NODE_ENV === 'production'
    });
    res.clearCookie('role', {
      httpOnly: true,
      sameSite: 'Strict',
      // Uncomment the line below in production if using HTTPS
      // secure: process.env.NODE_ENV === 'production'
    });
 
    res.redirect('/api/auth/login');
    // Respond with a success message
   // res.status(200).json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout', error: error.message });
  }
};
