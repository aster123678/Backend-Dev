const express = require("express");
const mongoose = require("mongoose");
const Post = require("./postModel");

const app = express();
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/soft_delete_system")
  .then(() => console.log("MongoDB connected for exercise 4"))
  .catch((error) => console.error(error.message));

app.post("/posts", async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await post.softDelete();
    res.json({ message: "Post soft deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(3003, () => {
  console.log("Exercise 4 running on http://localhost:3003");
});
