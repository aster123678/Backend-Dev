const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const cors = require("cors");
const validator = require("validator");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const app = express();
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

app.use(express.json());
app.use(mongoSanitize());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"]
      }
    }
  })
);

app.use(
  cors({
    origin: ["https://app.connecthub.com", "https://m.connecthub.com"],
    credentials: true
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "connecthub-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/connecthub"
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 12 * 60 * 60 * 1000
    }
  })
);

const User = {
  async findById(id) {
    return { _id: id, username: "krish" };
  },
  async findByIdAndUpdate(id, update) {
    return { _id: id, ...update };
  }
};

const Message = {
  async findOne(query) {
    if (query._id === "msg1" && query.$or) {
      return { _id: "msg1", text: "Private message" };
    }

    return null;
  }
};

function sanitizeRegistrationInput(body) {
  const username = validator.escape(String(body.username || "").trim()).slice(0, 30);
  const email = validator.normalizeEmail(String(body.email || "").trim());
  const bio = DOMPurify.sanitize(String(body.bio || ""), {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a"],
    ALLOWED_ATTR: ["href"]
  }).slice(0, 300);

  const profileUrl = String(body.profileUrl || "").trim();

  if (!username || !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    throw new Error("Username should be 3 to 30 characters and simple");
  }

  if (!email || !validator.isEmail(email)) {
    throw new Error("Please enter a valid email");
  }

  if (profileUrl && !validator.isURL(profileUrl, { protocols: ["https"], require_protocol: true })) {
    throw new Error("Profile picture URL must be a valid https link");
  }

  return { username, email, bio, profileUrl };
}

function sanitizePost(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Post content is required");
  }

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a"],
    ALLOWED_ATTR: ["href"]
  }).slice(0, 2000);
}

function sanitizePlainText(value, limit = 500) {
  const clean = validator.escape(String(value || "").trim());

  if (!clean) {
    throw new Error("Text is required");
  }

  return clean.slice(0, limit);
}

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Please log in first" });
  }

  next();
}

app.post("/register", (req, res) => {
  try {
    const safeUser = sanitizeRegistrationInput(req.body);
    res.status(201).json({ message: "User registered", user: safeUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/profile/bio", requireAuth, async (req, res) => {
  try {
    const bio = DOMPurify.sanitize(String(req.body.bio || ""), {
      ALLOWED_TAGS: ["b", "i", "em", "strong", "a"],
      ALLOWED_ATTR: ["href"]
    }).slice(0, 300);

    const updated = await User.findByIdAndUpdate(req.session.userId, { bio });
    res.json({ message: "Bio updated", profile: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/posts", requireAuth, (req, res) => {
  try {
    const content = sanitizePost(req.body.content);
    res.status(201).json({ message: "Post created", content });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/messages", requireAuth, (req, res) => {
  try {
    const text = sanitizePlainText(req.body.text, 1000);
    res.status(201).json({ message: "Message sent", text });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/messages/:id", requireAuth, async (req, res) => {
  const message = await Message.findOne({
    _id: req.params.id,
    $or: [{ sender: req.session.userId }, { receiver: req.session.userId }]
  });

  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  res.json(message);
});

module.exports = app;
