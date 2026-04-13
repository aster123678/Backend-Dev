const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  lastLoginAt: Date,
  lastLogoutAt: Date,
  lastActiveAt: Date
});

userSchema.methods.markLogin = function () {
  const now = new Date();
  this.lastLoginAt = now;
  this.lastActiveAt = now;
  return this.save();
};

userSchema.methods.markLogout = function () {
  this.lastLogoutAt = new Date();
  return this.save();
};

userSchema.methods.markActive = function () {
  this.lastActiveAt = new Date();
  return this.save();
};

module.exports = mongoose.model("TrackedUser", userSchema);
