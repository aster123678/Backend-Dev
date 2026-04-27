const express = require("express");
const session = require("express-session");

const app = express();
app.use(express.json());
app.use(
  session({
    secret: "auth-secret",
    resave: false,
    saveUninitialized: false,
  }),
);

const users = [
  { id: 1, username: "alice", role: "user" },
  { id: 2, username: "mona", role: "moderator" },
  { id: 3, username: "adam", role: "admin" },
];

const posts = [];
const roleRank = { user: 1, moderator: 2, admin: 3 };

const isAuthenticated = (req, res, next) => {
  const currentUser = users.find((user) => user.id === req.session.userId);

  if (!currentUser) {
    return res.status(401).json({ error: "Please log in first." });
  }

  req.user = currentUser;
  next();
};

const requireRole = (role) => (req, res, next) => {
  if (roleRank[req.user.role] < roleRank[role]) {
    return res.status(403).json({
      error: `This action requires ${role} privileges or higher.`,
    });
  }

  next();
};

const isOwnerOrModerator = (req, res, next) => {
  const post = posts.find((entry) => entry.id === Number(req.params.id));

  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  req.post = post;

  const isOwner = post.authorId === req.user.id;
  const canModerate = roleRank[req.user.role] >= roleRank.moderator;

  if (!isOwner && !canModerate) {
    return res.status(403).json({
      error: "You can only edit your own posts unless you are a moderator or admin.",
    });
  }

  next();
};

app.post("/login", (req, res) => {
  const { userId } = req.body;
  const user = users.find((entry) => entry.id === Number(userId));

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  req.session.userId = user.id;

  res.json({
    message: "Logged in successfully.",
    user,
  });
});

app.post("/posts", isAuthenticated, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "title and content are required." });
  }

  const newPost = {
    id: posts.length + 1,
    title: title.trim(),
    content: content.trim(),
    authorId: req.user.id,
    authorName: req.user.username,
    updatedAt: new Date().toISOString(),
  };

  posts.push(newPost);

  return res.status(201).json({
    message: "Post created.",
    post: newPost,
  });
});

app.put("/posts/:id", isAuthenticated, isOwnerOrModerator, (req, res) => {
  const { title, content } = req.body;

  if (title) {
    req.post.title = title.trim();
  }

  if (content) {
    req.post.content = content.trim();
  }

  req.post.updatedAt = new Date().toISOString();

  return res.json({
    message: "Post updated.",
    post: req.post,
  });
});

app.delete("/posts/:id", isAuthenticated, requireRole("moderator"), (req, res) => {
  const postIndex = posts.findIndex((entry) => entry.id === Number(req.params.id));

  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found." });
  }

  const [deletedPost] = posts.splice(postIndex, 1);

  return res.json({
    message: "Post deleted.",
    post: deletedPost,
  });
});

app.get("/users", isAuthenticated, requireRole("admin"), (req, res) => {
  res.json({
    message: "Admin user management view.",
    users,
  });
});

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.listen(3000, () => {
  console.log("Problem 3 server is running on port 3000");
});
