const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  try {
    const { title, content, status } = req.body;
    
    const post = new Post({
      title,
      content,
      author: req.user._id,
      status: status || 'draft'
    });

    await post.save();
    res.redirect('/api/posts/') // Only send one response
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getPostById = async (id) => {
  try {
    const post = await Post.findById(id).populate('author', 'username');
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    return post;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getPostsAdmin = async (req) => {
  if (!req.user) {
    throw new Error('User not authenticated.');
  }
  
  if (req.user.role !== 'admin') {
    throw new Error('Access denied. Admins only.');
  }

  try {
    // Fetch all posts with title, content, and author populated
    const posts = await Post.find({})
      .select('title content author')
      .populate('author', 'username');
    return posts;
  } catch (error) {
    console.error(error);
    throw new Error('Error loading admin posts.');
  }
};


exports.getPosts = async (req, res) => {
  try {
    const query = { $or: [{ status: 'published' }, { author: req.user._id }] };

    const posts = await Post.find(query).populate('author', 'username');
    return posts; // Return the posts instead of sending the response here
  } catch (error) {
    console.error(error); // Log the error for debugging
    throw new Error('Error loading posts.');
  }
};


exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;

    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Admins can update any post, users can only update their own
    if (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.status = status || post.status;

    await post.save();
    res.redirect('/api/posts/') 
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Admins can delete any post, users can only delete their own
    if (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(id);
    res.redirect('/api/posts/') // Only send one response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

