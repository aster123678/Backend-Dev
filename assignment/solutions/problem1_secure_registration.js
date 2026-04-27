const express = require("express");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

const SALT_ROUNDS = 10;
const users = [];

function validatePassword(password) {
  const issues = [];

  if (!password || password.length < 8) {
    issues.push("Password must be at least 8 characters long.");
  }

  if (!/[A-Z]/.test(password)) {
    issues.push("Password must include at least one uppercase letter.");
  }

  if (!/[a-z]/.test(password)) {
    issues.push("Password must include at least one lowercase letter.");
  }

  if (!/\d/.test(password)) {
    issues.push("Password must include at least one number.");
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]\\/~`+=;]/.test(password)) {
    issues.push("Password must include at least one special character.");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "username, email, and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = users.find((user) => user.email === normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        error: "An account with that email already exists.",
      });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({
        error: "Password does not meet security requirements.",
        issues: passwordCheck.issues,
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = {
      id: users.length + 1,
      username: username.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    return res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: "Registration failed.",
      details: error.message,
    });
  }
});

app.get("/users", (req, res) => {
  res.json(
    users.map(({ passwordHash, ...user }) => user),
  );
});

app.listen(3000, () => {
  console.log("Problem 1 server is running on port 3000");
});
