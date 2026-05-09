import mongoose from 'mongoose';

const repoSchema = new mongoose.Schema({
  owner: { type: String, required: true },
  name: { type: String, required: true },
  fullName: { type: String, unique: true }, // e.g., "facebook/react"
  healthScore: { type: Number, default: 100 },
  burnoutAlert: { type: Boolean, default: false },
  lastKnownCommitCount: { type: Number, default: 0 },
  // History for the chart
  history: [{
    timestamp: { type: Date, default: Date.now },
    commitCount: Number,
    score: Number
  }]
});

export const Repo = mongoose.model('Repo', repoSchema);