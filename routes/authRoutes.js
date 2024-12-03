const express = require('express');
const { register, login, logout } = require('../controllers/authController');

const router = express.Router();

// Route to display the registration form
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// Route to handle registration form submission
router.post('/register', register);

// Route to display the login form
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login'});
});

// Route to handle login form submission
router.post('/login', login);

router.post('/logout', logout);


module.exports = router;
