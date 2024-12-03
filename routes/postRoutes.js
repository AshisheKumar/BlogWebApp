const express = require('express');
const { 
  createPost, 
  getPosts, 
  getPostById, 
  updatePost, 
  deletePost ,
  getPostsAdmin,
} = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
// const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// const methodOverride = require('method-override');
// app.use(methodOverride('_method'));


// Route to render the create post form
router.get('/new', authMiddleware, (req, res) => {
  res.render('createPost', { title: 'Create New Post' });
});

// Route to handle post creation via form submission
router.post('/', authMiddleware, createPost);

// Route to render the list of posts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await getPosts(req, res);
     // This returns a JSON response, not an array directly
    console.log(posts); // Check what the output is
    res.render('posts', { title: 'Posts', posts }); // Pass the array to the view
  } catch (error) {
    res.status(500).send('Error loading posts.');
  }
});

router.get('/admin', authMiddleware, async (req, res) => {
  try {
    // Ensure only admins can access this route
    if (req.user.role !== 'admin') {
      return res.status(403).send('Access denied. Admins only.');
    }

    // Fetch posts using the admin-specific function
    const posts = await getPostsAdmin(req); // Adjusted function to return data

    // Render the posts view with the fetched data
    res.render('adminPosts', { title: 'Admin Posts', posts });
  } catch (error) {
    console.error('Error loading admin posts:', error);
    res.status(500).send('Error loading posts.');
  }
});

// Route to render the edit post form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  const postId = req.params.id; // Get post ID from URL params
  try {
    // Fetch the post using getPostById
    const post = await getPostById(postId);

    // If post is found, render the edit page with the post data
    res.render('editPost', { title: 'Edit Post', post });
  } catch (error) {
    // Handle errors (e.g., post not found or other issues)
    res.status(404).send(error.message);
  }
});

// Route to handle post updates via form submission
router.put('/:id', authMiddleware, updatePost);

// Route to handle post deletion
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
