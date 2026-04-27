const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
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
    referrerPolicy: { policy: "no-referrer" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"]
      }
    }
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "medibook-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medibook"
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000
    }
  })
);

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
}

function auditLog(action, req, details = {}) {
  console.log(JSON.stringify({
    action,
    userId: req.session.user?.id,
    role: req.session.user?.role,
    ip: req.ip,
    time: new Date().toISOString(),
    details
  }));
}

function sanitizePatientData(body) {
  const email = validator.normalizeEmail(String(body.email || "").trim());
  const phone = String(body.phone || "").replace(/[^\d+]/g, "");
  const dob = new Date(body.dob);

  if (!email || !validator.isEmail(email)) {
    throw new Error("Invalid email address");
  }

  if (!validator.isMobilePhone(phone, "any")) {
    throw new Error("Invalid phone number");
  }

  if (Number.isNaN(dob.getTime())) {
    throw new Error("Date of birth must be a real date");
  }

  return {
    fullName: validator.escape(String(body.fullName || "").trim()).slice(0, 80),
    email,
    phone,
    dob: dob.toISOString(),
    symptoms: DOMPurify.sanitize(String(body.symptoms || ""), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    }).slice(0, 2000)
  };
}

function validateMedicalFile(file) {
  const allowed = ["application/pdf", "image/jpeg", "image/png", "application/dicom"];

  if (!file || !allowed.includes(file.mimetype)) {
    throw new Error("Unsupported medical document type");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Document size is too large");
  }
}

app.post("/patients/register", (req, res) => {
  try {
    const patient = sanitizePatientData(req.body);
    res.status(201).json({ message: "Patient registered", patient });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/records/:patientId", requireRole("doctor", "nurse", "admin"), (req, res) => {
  const patientId = String(req.params.patientId || "").trim();

  if (!/^[a-fA-F0-9]{24}$/.test(patientId)) {
    return res.status(400).json({ error: "Invalid patient id" });
  }

  auditLog("medical-record-access", req, { patientId });
  res.json({ message: "Medical record returned safely" });
});

app.post("/documents/upload", requireRole("patient", "doctor", "nurse"), (req, res) => {
  try {
    validateMedicalFile(req.file);
    auditLog("document-upload", req, { filename: req.file?.originalname });
    res.status(201).json({ message: "Document uploaded for secure storage" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/doctors/search", (req, res) => {
  const specialty = validator.escape(String(req.query.specialty || "").trim());

  if (!specialty || specialty.length > 40) {
    return res.status(400).json({ error: "Valid specialty is required" });
  }

  res.json([{ name: "Dr. Mehta", specialty }]);
});

module.exports = app;
