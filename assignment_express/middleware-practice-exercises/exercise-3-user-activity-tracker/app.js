const express = require("express");
const mongoose = require("mongoose");
const User = require("./userModel");

const app = express();
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/user_activity_tracker")
  .then(() => console.log("MongoDB connected for exercise 3"))
  .catch((error) => console.error(error.message));

app.post("/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/login/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.markLogin();
    res.json({ message: "Login time saved", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/logout/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.markLogout();
    res.json({ message: "Logout time saved", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/activity/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.markActive();
    res.json({ message: "Last active time updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(3002, () => {
  console.log("Exercise 3 running on http://localhost:3002");
});
