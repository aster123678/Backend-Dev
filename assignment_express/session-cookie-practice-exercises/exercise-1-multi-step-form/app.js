const express = require("express");
const session = require("express-session");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "multi-step-secret",
    resave: false,
    saveUninitialized: true
  })
);

app.get("/step-1", (req, res) => {
  res.send(`
    <h2>Step 1</h2>
    <form method="post" action="/step-1">
      <input name="name" placeholder="Enter name" />
      <button type="submit">Next</button>
    </form>
  `);
});

app.post("/step-1", (req, res) => {
  req.session.formData = req.session.formData || {};
  req.session.formData.name = req.body.name;
  res.redirect("/step-2");
});

app.get("/step-2", (req, res) => {
  res.send(`
    <h2>Step 2</h2>
    <form method="post" action="/step-2">
      <input name="email" placeholder="Enter email" />
      <button type="submit">Next</button>
    </form>
  `);
});

app.post("/step-2", (req, res) => {
  req.session.formData = req.session.formData || {};
  req.session.formData.email = req.body.email;
  res.redirect("/step-3");
});

app.get("/step-3", (req, res) => {
  res.send(`
    <h2>Step 3</h2>
    <form method="post" action="/step-3">
      <input name="city" placeholder="Enter city" />
      <button type="submit">Finish</button>
    </form>
  `);
});

app.post("/step-3", (req, res) => {
  req.session.formData = req.session.formData || {};
  req.session.formData.city = req.body.city;

  res.send(`
    <h2>Registration Complete</h2>
    <pre>${JSON.stringify(req.session.formData, null, 2)}</pre>
  `);
});

app.listen(4000, () => {
  console.log("Exercise 1 running on http://localhost:4000/step-1");
});
