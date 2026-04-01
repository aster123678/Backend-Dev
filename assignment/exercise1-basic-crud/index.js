const express = require("express");
const mongoose = require("mongoose");

const app = express();
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_management_system";

app.use(express.json());

// Student schema for Exercise 1.
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    age: {
      type: Number,
      min: 0
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4
    },
    courses: {
      type: [String],
      default: []
    },
    city: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Student = mongoose.model("Student", studentSchema);
const sampleStudents = [
  {
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    age: 20,
    gpa: 3.8,
    courses: ["Mathematics", "Physics", "Computer Science"],
    city: "Delhi"
  },
  {
    name: "Priya Singh",
    email: "priya.singh@example.com",
    age: 21,
    gpa: 3.4,
    courses: ["English", "History", "Political Science", "Economics"],
    city: "Mumbai"
  },
  {
    name: "Rohan Mehta",
    email: "rohan.mehta@example.com",
    age: 22,
    gpa: 3.1,
    courses: ["Biology", "Chemistry", "Statistics", "Psychology", "Sociology", "Philosophy"],
    city: "Bengaluru"
  },
  {
    name: "Sneha Patel",
    email: "sneha.patel@example.com",
    age: 19,
    gpa: 3.9,
    courses: ["Computer Science", "Data Structures", "Algorithms", "Database Systems"],
    city: "Ahmedabad"
  }
];

async function seedSampleStudents() {
  const studentCount = await Student.countDocuments();

  if (studentCount === 0) {
    await Student.insertMany(sampleStudents);
    console.log("Sample student data inserted.");
  }
}

async function connectToDatabase() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");
    await seedSampleStudents();
}

app.get("/", (req, res) => {
  res.json({
    message: "Student Management System API is running.",
    endpoints: [
      "POST /students",
      "GET /students",
      "GET /students/email/:email",
      "PUT /students/:id",
      "DELETE /students/:id"
    ]
  });
});

app.post("/students", async (req, res) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();

    res.status(201).json({
      message: "Student created successfully.",
      student: savedStudent
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A student with this email already exists."
      });
    }

    res.status(400).json({
      message: "Failed to create student.",
      error: error.message
    });
  }
});

app.get("/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    res.status(200).json({
      count: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students.",
      error: error.message
    });
  }
});

app.get("/students/email/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({
        message: "Student not found."
      });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student by email.",
      error: error.message
    });
  }
});

app.put("/students/:id", async (req, res) => {
    const { gpa } = req.body;

    if (typeof gpa !== "number") {
      return res.status(400).json({
        message: "Please provide a valid numeric GPA."
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { gpa },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found."
      });
    }

    res.status(200).json({
      message: "Student GPA updated successfully.",
      student: updatedStudent
    });
});

app.delete("/students/:id", async (req, res) => {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({
        message: "Student not found."
      });
    }

    res.status(200).json({
      message: "Student deleted successfully.",
      student: deletedStudent
    });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
  connectToDatabase();
});
