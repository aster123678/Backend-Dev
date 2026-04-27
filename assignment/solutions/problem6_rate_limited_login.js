const express = require("express");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

const users = [
  {
    id: 1,
    email: "john@example.com",
    passwordHash: bcrypt.hashSync("SecurePass123!", 10),
  },
];

const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000;
const LOCK_TIME_MS = 30 * 60 * 1000;

function checkLoginAttempts(email) {
  const record = loginAttempts.get(email);

  if (!record) {
    return { allowed: true };
  }

  const now = Date.now();

  if (record.lockUntil && record.lockUntil > now) {
    const minutesLeft = Math.ceil((record.lockUntil - now) / 60000);
    return {
      allowed: false,
      message: `Account locked. Try again in ${minutesLeft} minute(s).`,
    };
  }

  if (now - record.firstAttemptAt > WINDOW_MS) {
    loginAttempts.delete(email);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(email) {
  const now = Date.now();
  const existingRecord = loginAttempts.get(email);

  if (!existingRecord || now - existingRecord.firstAttemptAt > WINDOW_MS) {
    loginAttempts.set(email, {
      count: 1,
      firstAttemptAt: now,
      lockUntil: null,
    });
    return;
  }

  existingRecord.count += 1;

  if (existingRecord.count >= MAX_ATTEMPTS) {
    existingRecord.lockUntil = now + LOCK_TIME_MS;
  }

  loginAttempts.set(email, existingRecord);
}

function clearAttempts(email) {
  loginAttempts.delete(email);
}

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const attemptStatus = checkLoginAttempts(normalizedEmail);

  if (!attemptStatus.allowed) {
    return res.status(429).json({ error: attemptStatus.message });
  }

  const user = users.find((entry) => entry.email === normalizedEmail);

  if (!user) {
    recordFailedAttempt(normalizedEmail);
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    recordFailedAttempt(normalizedEmail);

    const updatedRecord = loginAttempts.get(normalizedEmail);
    const attemptsLeft = Math.max(0, MAX_ATTEMPTS - updatedRecord.count);

    return res.status(401).json({
      error: "Invalid credentials.",
      attemptsLeft,
    });
  }

  clearAttempts(normalizedEmail);

  return res.json({
    message: "Login successful.",
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

app.get("/attempts/:email", (req, res) => {
  const email = req.params.email.trim().toLowerCase();
  const record = loginAttempts.get(email) || null;

  res.json({ email, record });
});

app.listen(3000, () => {
  console.log("Problem 6 server is running on port 3000");
});
