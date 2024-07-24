// jshint esversion:6
const _ = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare...";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque...";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien...";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ashishkumarr1108:Tarang123@cluster0.0gil2nn.mongodb.net/blogDB", { useNewUrlParser: true, useUnifiedTopology: true });

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/", function(req, res) {
  Post.find({}, function(err, posts) {
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
    });
  });
});

app.get("/about", function(req, res) {
  res.render("about", { about: aboutContent });
});

app.get("/contact", function(req, res) {
  res.render("contact", { contact: contactContent });
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

app.post("/compose", function(req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  post.save(function(err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.get("/posts/:postId", function(req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function(err, post) {
    if (!err) {
      res.render("post", {
        title: post.title,
        content: post.content,
        postId: post._id
      });
    }
  });
});

app.get("/posts/edit/:postId", function(req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function(err, post) {
    res.render("edit", {
      title: post.title,
      content: post.content,
      postId: post._id
    });
  });
});

app.post("/edit/:postId", function(req, res) {
  const postId = req.params.postId;

  Post.updateOne(
    { _id: postId },
    { title: req.body.postTitle, content: req.body.postBody },
    function(err) {
      if (!err) {
        res.redirect("/posts/" + postId);
      }
    }
  );
});

app.post("/delete/:postId", function(req, res) {
  const postId = req.params.postId;

  Post.deleteOne({ _id: postId }, function(err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
