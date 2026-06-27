const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['aptitude', 'technical', 'hr']
  },
  subCategory: {
    type: String,
    required: true
    // e.g., 'Quantitative Aptitude', 'DSA', 'DBMS', 'Operating Systems', etc.
  },
  topic: {
    type: String,
    required: true
    // e.g., 'Averages', 'Syllogism', 'Pointers', 'Normalization', etc.
  },
  title: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  correctOptionIndex: {
    type: Number,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  },
  codeSnippet: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', QuestionSchema);
