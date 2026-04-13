const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const SECRET_KEY = "simple-secret-key";
const OTP_CODE = "123456";

function checkJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "JWT token is required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid JWT token" });
  }
}

function checkOtp(req, res, next) {
  const otp = req.headers["x-otp-code"];

  if (otp !== OTP_CODE) {
    return res.status(401).json({ message: "Invalid OTP code" });
  }

  next();
}

app.get("/token", (req, res) => {
  const token = jwt.sign({ id: 1, name: "Demo User" }, SECRET_KEY, {
    expiresIn: "1h"
  });

  res.json({
    token,
    otp: OTP_CODE
  });
});

app.post("/transfer-money", checkJwt, checkOtp, (req, res) => {
  res.json({
    message: "Sensitive action completed",
    user: req.user
  });
});

app.listen(3001, () => {
  console.log("Exercise 2 running on http://localhost:3001");
});
