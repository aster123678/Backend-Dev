const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_management_system";

const studentSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true
    },
    age: Number,
    gpa: Number,
    courses: [String],
    city: String
  },
  {
    timestamps: true
  }
);

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

async function runAdvancedQueries() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for Exercise 2.");

    // 1. Students with GPA between 3.0 and 3.5
    const studentsWithGpaRange = await Student.find({
      gpa: { $gte: 3.0, $lte: 3.5 }
    }).sort({ gpa: 1 });

    // 2. Students with more than 5 courses
    const studentsWithMoreThanFiveCourses = await Student.find({
      $expr: { $gt: [{ $size: "$courses" }, 5] }
    });

    // 3. Top 10 students by GPA (descending)
    const topTenStudentsByGpa = await Student.find()
      .sort({ gpa: -1, name: 1 })
      .limit(10);

    // 4. Count students by city
    const studentCountByCity = await Student.aggregate([
      {
        $group: {
          _id: "$city",
          totalStudents: { $sum: 1 }
        }
      },
      {
        $sort: {
          totalStudents: -1,
          _id: 1
        }
      }
    ]);

    console.log("\n1. Students with GPA between 3.0 and 3.5");
    console.log(studentsWithGpaRange);

    console.log("\n2. Students with more than 5 courses");
    console.log(studentsWithMoreThanFiveCourses);

    console.log("\n3. Top 10 students by GPA");
    console.log(topTenStudentsByGpa);

    console.log("\n4. Count students by city");
    console.log(studentCountByCity);
  } catch (error) {
    console.error("Error running advanced queries:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed for Exercise 2.");
  }
}

runAdvancedQueries();
