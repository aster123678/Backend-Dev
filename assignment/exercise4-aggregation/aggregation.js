const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_management_system";

const analyticsStudentSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true
    },
    department: String,
    gpa: Number
  },
  {
    timestamps: true
  }
);

const analyticsCourseSchema = new mongoose.Schema(
  {
    name: String,
    department: String,
    credits: Number
  },
  {
    timestamps: true
  }
);

const analyticsGradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnalyticsStudent"
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnalyticsCourse"
    },
    grade: String
  },
  {
    timestamps: true
  }
);

const AnalyticsStudent =
  mongoose.models.AnalyticsStudent ||
  mongoose.model("AnalyticsStudent", analyticsStudentSchema);
const AnalyticsCourse =
  mongoose.models.AnalyticsCourse ||
  mongoose.model("AnalyticsCourse", analyticsCourseSchema);
const AnalyticsGrade =
  mongoose.models.AnalyticsGrade ||
  mongoose.model("AnalyticsGrade", analyticsGradeSchema);

async function seedAggregationData() {
  const existingStudents = await AnalyticsStudent.countDocuments();

  if (existingStudents > 0) {
    return;
  }

  const students = await AnalyticsStudent.insertMany([
    { name: "Aarav Sharma", email: "aarav.analytics@example.com", department: "Computer Science", gpa: 3.8 },
    { name: "Priya Singh", email: "priya.analytics@example.com", department: "Electronics", gpa: 3.4 },
    { name: "Rohan Mehta", email: "rohan.analytics@example.com", department: "Computer Science", gpa: 3.1 },
    { name: "Sneha Patel", email: "sneha.analytics@example.com", department: "Mathematics", gpa: 3.9 }
  ]);

  const courses = await AnalyticsCourse.insertMany([
    { name: "Database Systems", department: "Computer Science", credits: 4 },
    { name: "Machine Learning", department: "Computer Science", credits: 4 },
    { name: "Digital Electronics", department: "Electronics", credits: 3 },
    { name: "Linear Algebra", department: "Mathematics", credits: 3 }
  ]);

  await AnalyticsGrade.insertMany([
    { student: students[0]._id, course: courses[0]._id, grade: "A" },
    { student: students[0]._id, course: courses[1]._id, grade: "A-" },
    { student: students[1]._id, course: courses[2]._id, grade: "B+" },
    { student: students[2]._id, course: courses[0]._id, grade: "B" },
    { student: students[2]._id, course: courses[1]._id, grade: "B+" },
    { student: students[3]._id, course: courses[3]._id, grade: "A" },
    { student: students[3]._id, course: courses[0]._id, grade: "A-" }
  ]);

  console.log("Aggregation sample data inserted.");
}

async function runAggregationQueries() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for Exercise 4.");

    await seedAggregationData();

    // 1. Average GPA by department
    const averageGpaByDepartment = await AnalyticsStudent.aggregate([
      {
        $group: {
          _id: "$department",
          averageGpa: { $avg: "$gpa" },
          studentCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          averageGpa: { $round: ["$averageGpa", 2] },
          studentCount: 1
        }
      },
      {
        $sort: {
          averageGpa: -1
        }
      }
    ]);

    // 2. Most popular courses (based on enrollment count)
    const mostPopularCourses = await AnalyticsGrade.aggregate([
      {
        $group: {
          _id: "$course",
          enrollmentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "analyticscourses",
          localField: "_id",
          foreignField: "_id",
          as: "courseDetails"
        }
      },
      {
        $project: {
          _id: 0,
          courseId: "$_id",
          enrollmentCount: 1,
          courseName: { $arrayElemAt: ["$courseDetails.name", 0] },
          department: { $arrayElemAt: ["$courseDetails.department", 0] }
        }
      },
      {
        $sort: {
          enrollmentCount: -1,
          courseName: 1
        }
      }
    ]);

    // 3. Student performance report (GPA + course count)
    const studentPerformanceReport = await AnalyticsStudent.aggregate([
      {
        $lookup: {
          from: "analyticsgrades",
          localField: "_id",
          foreignField: "student",
          as: "gradeRecords"
        }
      },
      {
        $project: {
          _id: 0,
          studentId: "$_id",
          name: 1,
          department: 1,
          gpa: 1,
          courseCount: { $size: "$gradeRecords" }
        }
      },
      {
        $sort: {
          gpa: -1,
          courseCount: -1,
          name: 1
        }
      }
    ]);

    console.log("\n1. Average GPA by department");
    console.log(averageGpaByDepartment);

    console.log("\n2. Most popular courses");
    console.log(mostPopularCourses);

    console.log("\n3. Student performance report");
    console.log(studentPerformanceReport);
  } catch (error) {
    console.error("Error running aggregation queries:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed for Exercise 4.");
  }
}

runAggregationQueries();
