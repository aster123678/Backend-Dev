const mongoose = require("mongoose");

const professorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    departments: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.Professor || mongoose.model("Professor", professorSchema);
