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

const router = express.Router();

router.get('/new', authMiddleware, (req, res) => {
  res.render('createPost', { title: 'Create New Post' });
});

router.post('/', authMiddleware, createPost);

router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await getPosts(req, res);
     
    console.log(posts); 
    res.render('posts', { title: 'Posts', posts }); 
  } catch (error) {
    res.status(500).send('Error loading posts.');
  }
});

router.get('/admin', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).send('Access denied. Admins only.');
    }

    const posts = await getPostsAdmin(req); 

    res.render('adminPosts', { title: 'Admin Posts', posts });
  } catch (error) {
    console.error('Error loading admin posts:', error);
    res.status(500).send('Error loading posts.');
  }
});

router.get('/edit/:id', authMiddleware, async (req, res) => {
  const postId = req.params.id; 
  try {
    
    const post = await getPostById(postId);
    res.render('editPost', { title: 'Edit Post', post });
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.put('/:id', authMiddleware, updatePost);

router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
