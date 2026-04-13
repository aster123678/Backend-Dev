const express = require("express");
const session = require("express-session");

const app = express();
const SESSION_DURATION = 60 * 1000;

app.use(
  session({
    secret: "timeout-warning-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: SESSION_DURATION
    }
  })
);

app.use((req, res, next) => {
  const now = Date.now();

  if (!req.session.lastSeenAt) {
    req.session.lastSeenAt = now;
  }

  req.session.expiresAt = req.session.lastSeenAt + SESSION_DURATION;
  req.session.lastSeenAt = now;
  next();
});

app.get("/", (req, res) => {
  const timeLeft = req.session.expiresAt - Date.now();
  const warning =
    timeLeft <= 30 * 1000
      ? "Warning: your session will expire soon."
      : "Session is active.";

  res.send(`
    <h2>Session Timeout Warning</h2>
    <p>${warning}</p>
    <p>Time left: ${Math.max(0, Math.floor(timeLeft / 1000))} seconds</p>
    <a href="/">Refresh page</a>
  `);
});

app.listen(4003, () => {
  console.log("Exercise 4 running on http://localhost:4003");
});
