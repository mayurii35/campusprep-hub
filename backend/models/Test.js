const mongoose = require('mongoose');

const TestQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  explanation: { type: String, default: '' },
  codeSnippet: { type: String, default: '' },
  topic: { type: String, default: '' },
  difficulty: { type: String, default: 'Medium' }
});

const TestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Aptitude', 'Technical', 'Full-Length', 'Company-Specific']
  },
  duration: {
    type: Number, // In minutes
    required: true,
    default: 30
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  company: {
    type: String,
    default: ''
  },
  questions: [TestQuestionSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Test', TestSchema);
