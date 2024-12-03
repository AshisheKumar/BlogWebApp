require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser')
const methodOverride = require('method-override');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To handle form data
app.use(cookieParser());
app.use(methodOverride('_method'));
// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (e.g., CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// Routes for EJS pages
app.get('/', (req, res) => {
  res.render('index', { title: 'Home', message: 'Welcome to My App!' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About Us', description: 'This is the about page.' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
