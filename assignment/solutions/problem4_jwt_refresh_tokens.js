const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const ACCESS_SECRET = process.env.ACCESS_SECRET || "access-secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh-secret";

const users = [
  { id: 1, username: "john", password: "secret123", role: "user" },
];

const refreshTokens = new Set();

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    ACCESS_SECRET,
    { expiresIn: "15m" },
  );
}

function generateRefreshToken(user) {
  const token = jwt.sign(
    { id: user.id, username: user.username },
    REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  refreshTokens.add(token);
  return token;
}

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (entry) => entry.username === username && entry.password === password,
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return res.json({
    message: "Login successful.",
    accessToken,
    refreshToken,
  });
});

app.post("/token/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "refreshToken is required." });
  }

  if (!refreshTokens.has(refreshToken)) {
    return res.status(403).json({ error: "Refresh token is invalid or has been revoked." });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find((entry) => entry.id === payload.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const newAccessToken = generateAccessToken(user);

    return res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    refreshTokens.delete(refreshToken);
    return res.status(403).json({ error: "Refresh token expired or invalid." });
  }
});

app.post("/logout", (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }

  res.json({
    message: "Logged out successfully.",
  });
});

app.get("/protected", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token missing." });
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    return res.json({
      message: "Protected data retrieved successfully.",
      user: payload,
    });
  } catch (error) {
    return res.status(403).json({ error: "Access token is invalid or expired." });
  }
});

app.listen(3000, () => {
  console.log("Problem 4 server is running on port 3000");
});
