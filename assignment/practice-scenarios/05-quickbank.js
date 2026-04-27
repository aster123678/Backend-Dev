const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const crypto = require("crypto");
const validator = require("validator");

const app = express();

app.use(express.json());
app.use(mongoSanitize());

app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"]
      }
    }
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "quickbank-secret",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quickbank",
      crypto: {
        secret: process.env.MONGOSTORE_SECRET || "bank-store-secret"
      }
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 10 * 60 * 1000
    }
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 4,
  message: { error: "Too many login attempts" }
});

const transferLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: "Transfer limit reached for this minute" }
});

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Login required" });
  }

  next();
}

function audit(action, req, details = {}) {
  console.log(JSON.stringify({
    action,
    userId: req.session.user?.id,
    ip: req.ip,
    time: new Date().toISOString(),
    details
  }));
}

function cleanAccountNumber(value) {
  const account = String(value || "").trim();

  if (!/^\d{10,18}$/.test(account)) {
    throw new Error("Account number format is invalid");
  }

  return account;
}

function cleanMoney(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
    throw new Error("Transfer amount is outside the allowed range");
  }

  return Number(amount.toFixed(2));
}

function sanitizeDescription(value) {
  return validator.escape(String(value || "").trim()).slice(0, 120);
}

app.post("/login", authLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!validator.isEmail(String(email || "")) || String(password || "").length < 10) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ error: "Session could not be created" });
    }

    req.session.user = {
      id: "bank-user-1",
      email
    };

    req.session.deviceId = crypto.randomUUID();
    audit("login-success", req);
    res.json({ message: "Login successful" });
  });
});

app.post("/transfer", requireAuth, transferLimiter, (req, res) => {
  try {
    const fromAccount = cleanAccountNumber(req.body.fromAccount);
    const toAccount = cleanAccountNumber(req.body.toAccount);
    const amount = cleanMoney(req.body.amount);
    const description = sanitizeDescription(req.body.description);

    if (fromAccount === toAccount) {
      return res.status(400).json({ error: "Source and destination accounts cannot match" });
    }

    if (amount > 1000 && !req.body.twoFactorCode) {
      return res.status(403).json({ error: "2FA code is required for larger transfers" });
    }

    audit("money-transfer", req, { fromAccount, toAccount, amount });

    res.json({
      message: "Transfer approved",
      transfer: { fromAccount, toAccount, amount, description }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/transactions", requireAuth, (req, res) => {
  const account = cleanAccountNumber(req.query.account);

  if (req.query.ownerId && req.query.ownerId !== req.session.user.id) {
    return res.status(403).json({ error: "You can only view your own transactions" });
  }

  res.json([{ id: "txn1", account, amount: 250 }]);
});

app.post("/password-reset/request", (req, res) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 15 * 60 * 1000;

  res.json({
    message: "Reset link generated",
    reset: { token, expiresAt }
  });
});

app.use((err, req, res, next) => {
  audit("server-error", req, { message: err.message });
  res.status(500).json({ error: "Something went wrong. Please try again later." });
});

module.exports = app;
