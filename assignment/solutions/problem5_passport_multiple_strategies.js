const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(
  session({
    secret: "passport-secret",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

const JWT_SECRET = process.env.JWT_SECRET || "jwt-secret";

const users = [
  { id: 1, username: "krish", password: "Password123!", role: "user" },
  { id: 2, username: "admin", password: "AdminPass123!", role: "admin" },
];

passport.use(
  "local",
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = users.find((entry) => entry.username === username);

      if (!user || user.password !== password) {
        return done(null, false, { message: "Invalid username or password." });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    (payload, done) => {
      const user = users.find((entry) => entry.id === payload.id);

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find((entry) => entry.id === id);
  done(null, user || false);
});

app.post("/auth/login", (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).json({ error: info.message });
    }

    req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      return res.json({
        message: "Session login successful.",
        authType: "session",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    });
  })(req, res, next);
});

app.post("/auth/api-login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).json({ error: info.message });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    return res.json({
      message: "API login successful.",
      authType: "token",
      token,
    });
  })(req, res, next);
});

app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Please sign in with session auth first." });
  }

  return res.json({
    message: "Welcome to the dashboard.",
    user: req.user,
  });
});

app.get(
  "/api/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      message: "JWT profile access granted.",
      user: req.user,
    });
  },
);

app.get("/auth/modes", (req, res) => {
  res.json({
    supportedModes: ["session", "token"],
    advice: "Use /auth/login for browser sessions and /auth/api-login for API access.",
  });
});

app.listen(3000, () => {
  console.log("Problem 5 server is running on port 3000");
});
