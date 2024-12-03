const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

   
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

   
    user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user'
    });
    
    await user.save();

    
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '.5h' }
    );

    res.redirect('/api/auth/login');

    res.status(201);   
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    
    const tokan = req.cookies.token;
    if (tokan) {
      
      try {
        const decoded = jwt.verify(tokan, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user) {
          
          return res.status(400).json({ message: 'You are already logged in' });
        }
      } catch (err) {
        console.error('Token verification error:', err);
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
    }

   
    const { email, password } = req.body;

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    
    res.cookie('token', token, {
      httpOnly: true,  
      sameSite: 'Strict',   
    });
    res.cookie('role', user.role, {
      httpOnly: true,  
      sameSite: 'Strict',       
    });
    
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
      res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'Strict',
      
    });
    res.clearCookie('role', {
      httpOnly: true,
      sameSite: 'Strict',
      
    });
 
    res.redirect('/api/auth/login');
    

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout', error: error.message });
  }
};
