import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  domain: String, // e.g., 'DSA', 'OS', 'DBMS'
  type: String, // 'MCQ' or 'CODE'
  questionText: String,
  options: [String], // for MCQs
  correctAnswer: String, // for MCQs
  testCases: [{ input: String, expectedOutput: String }], // for Code
  difficulty: String // 'Medium', 'Hard'
});

const TestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [QuestionSchema],
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'EXPIRED'],
    default: 'PENDING'
  },
  score: {
    type: Number,
    default: 0
  },
  availableFrom: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  tabSwitches: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.models.Test || mongoose.model('Test', TestSchema);
