const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const validator = require("validator");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const app = express();
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

app.use(express.json());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://js.stripe.com"],
        imgSrc: ["'self'", "data:", "https://s3.amazonaws.com"],
        mediaSrc: ["'self'", "https://s3.amazonaws.com"],
        frameSrc: ["'self'", "https://js.stripe.com"],
        objectSrc: ["'none'"]
      }
    }
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "edulearn-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/edulearn"
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000
    }
  })
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts" }
});

const quizLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many quiz submissions" }
});

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: "You do not have access to this feature" });
    }

    next();
  };
}

function sanitizeCourseDescription(text) {
  return DOMPurify.sanitize(String(text || ""), {
    ALLOWED_TAGS: ["p", "b", "i", "em", "strong", "ul", "ol", "li", "br", "a"],
    ALLOWED_ATTR: ["href", "target"]
  }).slice(0, 5000);
}

function sanitizeQuizAnswer(answer) {
  return validator.escape(String(answer || "").trim()).slice(0, 300);
}

function validateUpload(file) {
  const allowedTypes = ["application/pdf", "video/mp4"];
  const maxSize = 20 * 1024 * 1024;

  if (!file || !allowedTypes.includes(file.mimetype)) {
    throw new Error("Only PDF and MP4 files are allowed");
  }

  if (file.size > maxSize) {
    throw new Error("File is too large");
  }

  return true;
}

app.post("/login", loginLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!validator.isEmail(String(email || "")) || String(password || "").length < 8) {
    return res.status(400).json({ error: "Invalid login details" });
  }

  req.session.user = {
    id: "u1",
    role: "student"
  };

  res.json({ message: "Logged in" });
});

app.post("/courses", requireRole("instructor", "admin"), (req, res) => {
  try {
    const title = validator.escape(String(req.body.title || "").trim()).slice(0, 120);
    const description = sanitizeCourseDescription(req.body.description);

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    res.status(201).json({ title, description });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/quiz/:id/submit", requireRole("student"), quizLimiter, (req, res) => {
  const answers = Array.isArray(req.body.answers) ? req.body.answers.map(sanitizeQuizAnswer) : [];

  if (!answers.length) {
    return res.status(400).json({ error: "Answers are required" });
  }

  res.json({
    message: "Quiz submitted",
    submittedAt: new Date().toISOString(),
    answersLocked: true
  });
});

app.post("/materials/upload", requireRole("instructor", "admin"), (req, res) => {
  try {
    validateUpload(req.file);
    res.status(201).json({ message: "Upload accepted for malware scan" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = app;
