const mongoose = require('mongoose');

const HiringRoundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  name: { type: String, required: true }, // e.g. "Online Assessment", "Technical Interview 1"
  description: { type: String, required: true }
});

const CompanyQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questionText: { type: String, required: true },
  role: { type: String, default: 'Software Engineer' },
  year: { type: String, default: '2025' },
  category: { type: String, enum: ['Coding', 'Aptitude', 'System Design', 'Behavioral'] }
});

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  logo: {
    type: String, // SVG path or short visual class representation
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  roles: [{ type: String }],
  packages: {
    type: String, // e.g. "12 - 18 LPA"
    required: true
  },
  hiringProcess: [HiringRoundSchema],
  previousQuestions: [CompanyQuestionSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', CompanySchema);
