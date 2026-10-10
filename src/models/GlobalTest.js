import mongoose from 'mongoose';

const GlobalTestSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  questions: [{
    domain: String,
    type: { type: String }, // 'MCQ' or 'CODE'
    questionText: String,
    options: [String],
    correctAnswer: String,
    testCases: [{ input: String, expectedOutput: String }],
    difficulty: String
  }]
}, { timestamps: true });

export default mongoose.models.GlobalTest || mongoose.model('GlobalTest', GlobalTestSchema);
