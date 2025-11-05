// models/Performance.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Flexible schema for performance data
const PerformanceSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  totalGames: {
    type: Number,
    default: 0
  },
  totalCorrect: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  // Store game types as a dynamic object

  gameTypes: {
  type: Map,
  of: {
    plays: Number,
    correct: Number,
    score: Number,
    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 }
  },
  default: {}
},

// In dailyStats Map schema, update to:
dailyStats: {
  type: Map,
  of: {
    plays: Number,
    correct: Number,
    score: Number,
    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    gameTypes: {
      type: Map,
      of: {
        plays: Number,
        correct: Number,
        score: Number,
        totalQuestions: { type: Number, default: 0 },
        correctAnswers: { type: Number, default: 0 }
      },
      default: {}
    }
  },
  default: {}
},

// In history array, update to:
history: [{
  date: String,
  timestamp: Date,
  gameType: String,
  difficulty: String,
  speed: Number,
  count: Number,
  correct: Boolean,
  score: Number,
  maxScore: Number,
  totalQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  accuracy: { type: String, default: '0%' }
}],

  // gameTypes: {
  //   type: Map,
  //   of: {
  //     plays: Number,
  //     correct: Number,
  //     score: Number
  //   },
  //   default: {}
  // },
  // // Store daily stats as a dynamic object with date strings as keys
  // dailyStats: {
  //   type: Map,
  //   of: {
  //     plays: Number,
  //     correct: Number,
  //     score: Number,
  //     // Nested map for game types within each day
  //     gameTypes: {
  //       type: Map,
  //       of: {
  //         plays: Number,
  //         correct: Number,
  //         score: Number
  //       },
  //       default: {}
  //     }
  //   },
  //   default: {}
  // },
  // // List of game history entries
  // history: [{
  //   date: String,
  //   timestamp: Date,
  //   gameType: String,
  //   difficulty: String,
  //   speed: Number,
  //   count: Number,
  //   CorrectCountAnswer: Number,
  //   correct: Boolean,
  //   score: Number,
  //   maxScore: Number
  // }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updated timestamp on save
// PerformanceSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

module.exports = mongoose.model('Performance', PerformanceSchema);