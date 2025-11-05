const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testType: { type: String, required: true, default: "general" },
  difficultyLevel: { type: String, enum: ['single', 'double', 'triple'], default: 'single' },
  count: { type: Number, required: true, default: 10 },

  duration: { type: Number, required: true }, // in minutes

  // Template / reference answers
  answers: [
    {
      questionIndex: Number,
      question: String,
      userAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean
    }
  ],

  startTime: { type: Date, required: true },
  endTime: Date,
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  targetStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Results per student
  results: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answers: [
      {
        questionIndex: Number,
        question: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean
      }
    ],
    correctCount: Number,
    totalQuestions: Number,
    score: Number,
    submittedAt: Date,
    status: { type: String, enum: ['in-progress', 'submitted', 'auto-submitted'], default: 'in-progress' },
    timeSpent: Number // in seconds
  }]
}, { timestamps: true });

const test = mongoose.model('Test', testSchema);

module.exports = test;

// const mongoose = require('mongoose');

// const testSchema = new mongoose.Schema({
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
// testType: { type: String, required: true, default: "general" },
// difficultyLevel: { type: String, enum: ['single', 'double', 'triple'], default: 'single' },
// count: { type: Number, required: true, default: 10 },

//   duration: { type: Number, required: true }, // in minutes
//  answers: [
//   {
//     questionIndex: Number,
//     question: String,
//     userAnswer: String,
//     correctAnswer: String,
//     isCorrect: Boolean
//   }
// ]
// ,
//   startTime: { type: Date, required: true },
//   endTime: Date,
//   status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
//   targetStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//   results: [{
//     studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     answers: [String],
//     correctCount: Number,
//     totalQuestions: Number,
//     score: Number,
//     submittedAt: Date,
//     status: { type: String, enum: ['in-progress', 'submitted', 'auto-submitted'], default: 'in-progress' },
//     timeSpent: Number // in seconds
//   }]
// }, { timestamps: true });

// const test = mongoose.model('Test', testSchema);

// module.exports = test;


