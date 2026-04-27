const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const validator = require("validator");
const bcrypt = require("bcrypt");

const app = express();
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

app.use(express.json());
app.use(mongoSanitize());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "https://cdn.shopeasy.com"],
        connectSrc: ["'self'", "https://api.stripe.com"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://www.youtube.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'", "https://checkout.stripe.com"]
      }
    }
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-this-in-real-project",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopeasy",
      collectionName: "sessions"
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 20 * 60 * 1000
    }
  })
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts. Try again in a bit." }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Too many requests right now." }
});

app.use("/api", apiLimiter);

const User = {
  async findOne(query) {
    return query.username === "admin" ? { _id: "u1", username: "admin", password: "$2b$10$hash" } : null;
  }
};

const Product = {
  async find(query) {
    return [{ name: "Phone", category: query.category, price: query.price || 499 }];
  }
};

const Review = {
  async create(data) {
    return { id: "r1", ...data };
  }
};

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access only" });
  }

  next();
}

function cleanCategory(value) {
  if (typeof value !== "string") {
    throw new Error("Category must be text");
  }

  const category = validator.trim(value);

  if (!/^[a-zA-Z0-9\s-]{2,40}$/.test(category)) {
    throw new Error("Category format is not valid");
  }

  return category;
}

function cleanPrice(value) {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Price must be a valid positive number");
  }

  return parsed;
}

function cleanReviewText(text) {
  if (typeof text !== "string") {
    throw new Error("Review must be text");
  }

  const stripped = DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();

  if (!stripped) {
    throw new Error("Review cannot be empty");
  }

  return stripped.slice(0, 1000);
}

app.post("/auth/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await User.findOne({ username: username.trim() });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordOk = await bcrypt.compare(password, user.password).catch(() => false);

    if (!passwordOk) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not start session" });
      }

      req.session.user = {
        id: user._id,
        username: user.username,
        role: "customer"
      };

      req.session.cookie.maxAge = 30 * 60 * 1000;

      res.json({ message: "Login successful" });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/products/search", async (req, res) => {
  try {
    const category = cleanCategory(req.query.category || "");
    const price = cleanPrice(req.query.price);

    const query = { category };

    if (price !== undefined) {
      query.price = price;
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const username = validator.escape(String(req.body.username || "").trim()).slice(0, 40);
    const review = cleanReviewText(req.body.review);

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const savedReview = await Review.create({
      username,
      review,
      createdAt: new Date()
    });

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/admin/orders", requireAdmin, (req, res) => {
  res.json({ message: "Only admins can see this route" });
});

module.exports = app;
