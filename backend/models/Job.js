const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: 'Remote'
  },
  type: {
    type: String,
    required: true,
    enum: ['Internship', 'Placement Drive', 'Job Opportunity']
  },
  salary: {
    type: String,
    required: true
  },
  eligibility: {
    type: String,
    default: 'Open to all branches'
  },
  description: {
    type: String,
    default: ''
  },
  deadline: {
    type: Date,
    required: true
  },
  applicantsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', JobSchema);
