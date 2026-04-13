const express = require("express");
const session = require("express-session");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "admin-panel-secret",
    resave: false,
    saveUninitialized: false
  })
);

const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "user", password: "user123", role: "user" }
];

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).send("Please login first");
  }

  next();
}

function requireAdmin(req, res, next) {
  if (req.session.user.role !== "admin") {
    return res.status(403).send("Only admin can access this page");
  }

  next();
}

app.get("/", (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="post" action="/login">
      <input name="username" placeholder="Username" />
      <input name="password" placeholder="Password" type="password" />
      <button type="submit">Login</button>
    </form>
  `);
});

app.post("/login", (req, res) => {
  const user = users.find(
    (item) =>
      item.username === req.body.username && item.password === req.body.password
  );

  if (!user) {
    return res.status(401).send("Invalid login");
  }

  req.session.user = {
    username: user.username,
    role: user.role
  };

  res.redirect("/dashboard");
});

app.get("/dashboard", requireLogin, (req, res) => {
  res.send(`
    <h2>Dashboard</h2>
    <p>Welcome ${req.session.user.username}</p>
    <p>Your role is ${req.session.user.role}</p>
    <a href="/admin">Open admin page</a><br />
    <a href="/logout">Logout</a>
  `);
});

app.get("/admin", requireLogin, requireAdmin, (req, res) => {
  res.send("<h2>Admin Panel</h2><p>Only admin users can see this page.</p>");
});

app.get("/logout", requireLogin, (req, res) => {
  req.session.destroy(() => {
    res.send("Logged out");
  });
});

app.listen(4002, () => {
  console.log("Exercise 3 running on http://localhost:4002");
});
