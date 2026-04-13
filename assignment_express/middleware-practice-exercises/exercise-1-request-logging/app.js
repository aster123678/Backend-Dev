const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const logFile = path.join(__dirname, "requests.log");

function requestLogger(req, res, next) {
  const startTime = Date.now();

  res.on("finish", () => {
    const responseTime = Date.now() - startTime;
    const logLine =
      `${new Date().toISOString()} | ${req.method} | ${req.originalUrl} | ` +
      `${res.statusCode} | ${responseTime}ms\n`;

    fs.appendFile(logFile, logLine, (error) => {
      if (error) {
        console.error("Could not write log:", error.message);
      }
    });
  });

  next();
}

app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("Request logging system is working.");
});

app.get("/about", (req, res) => {
  setTimeout(() => {
    res.send("About page");
  }, 200);
});

app.listen(3000, () => {
  console.log("Exercise 1 running on http://localhost:3000");
});
