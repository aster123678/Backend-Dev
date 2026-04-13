const express = require("express");

const app = express();
app.use(express.json());

function cleanValue(value) {
  if (typeof value === "string") {
    return value
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\$/g, "")
      .replace(/[{}]/g, "");
  }

  if (Array.isArray(value)) {
    return value.map(cleanValue);
  }

  if (value && typeof value === "object") {
    const cleanedObject = {};

    for (const key in value) {
      const safeKey = key.replace(/\$/g, "").replace(/\./g, "");
      cleanedObject[safeKey] = cleanValue(value[key]);
    }

    return cleanedObject;
  }

  return value;
}

function sanitizeInput(req, res, next) {
  req.body = cleanValue(req.body);
  req.query = cleanValue(req.query);
  req.params = cleanValue(req.params);
  next();
}

app.use(sanitizeInput);

app.post("/submit", (req, res) => {
  res.json({
    message: "Input sanitized successfully",
    data: req.body
  });
});

app.listen(3004, () => {
  console.log("Exercise 5 running on http://localhost:3004");
});
