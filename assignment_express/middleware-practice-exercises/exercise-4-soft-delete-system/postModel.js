const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
});

function hideDeleted(next) {
  this.where({ isDeleted: false });
  next();
}

postSchema.pre("find", hideDeleted);
postSchema.pre("findOne", hideDeleted);

postSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

module.exports = mongoose.model("Post", postSchema);
