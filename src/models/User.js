import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  image: {
    type: String,
  },
  rating: {
    type: Number,
    default: 1200, // starting rating
  },
  testsTaken: {
    type: Number,
    default: 0,
  },
  testsPassed: {
    type: Number,
    default: 0,
  },
  testsFailed: {
    type: Number,
    default: 0,
  },
  lastTestDate: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
