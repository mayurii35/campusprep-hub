const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  isOnboarded: {
    type: Boolean,
    default: false
  },
  profile: {
    fullName: { type: String, default: '' },
    collegeName: { type: String, default: '' },
    branch: { type: String, default: '' },
    academicYear: { type: String, default: '' },
    cgpa: { type: Number, default: 0 },
    skills: [{ type: String }],
    targetCompanies: [{ type: String }]
  },
  assessment: {
    aptitude: { type: Number, default: 0 },
    dsa: { type: Number, default: 0 },
    dbms: { type: Number, default: 0 },
    os: { type: Number, default: 0 },
    cn: { type: Number, default: 0 },
    oop: { type: Number, default: 0 },
    communication: { type: Number, default: 0 }
  },
  goal: {
    type: String,
    default: ''
  },
  roadmap: {
    placementReadinessScore: { type: Number, default: 0 },
    strengths: [{ type: String }],
    weakAreas: [{ type: String }],
    recommendedLearningPath: [{ type: String }],
    weeklyStudyPlan: [{
      week: { type: Number },
      topics: [{ type: String }],
      tasks: [{ type: String }]
    }],
    estimatedTimeline: { type: String, default: '' }
  },
  streak: {
    type: Number,
    default: 1
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  progress: {
    aptitude: { type: Number, default: 0 },
    dsa: { type: Number, default: 0 },
    dbms: { type: Number, default: 0 },
    os: { type: Number, default: 0 },
    cn: { type: Number, default: 0 },
    oop: { type: Number, default: 0 },
    hr: { type: Number, default: 0 },
    completedTasks: [{ type: String }]
  },
  activity: [{
    date: { type: Date, default: Date.now },
    action: { type: String },
    details: { type: String }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
