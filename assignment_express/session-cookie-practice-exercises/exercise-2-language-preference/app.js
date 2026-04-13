const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());

const messages = {
  en: "Hello",
  hi: "Namaste",
  fr: "Bonjour"
};

app.get("/", (req, res) => {
  const language = req.cookies.language || "en";
  const message = messages[language] || messages.en;

  res.send(`
    <h2>${message}</h2>
    <p>Current language: ${language}</p>
    <a href="/change-language/en">English</a><br />
    <a href="/change-language/hi">Hindi</a><br />
    <a href="/change-language/fr">French</a>
  `);
});

app.get("/change-language/:lang", (req, res) => {
  res.cookie("language", req.params.lang, { maxAge: 24 * 60 * 60 * 1000 });
  res.redirect("/");
});

app.listen(4001, () => {
  console.log("Exercise 2 running on http://localhost:4001");
});
