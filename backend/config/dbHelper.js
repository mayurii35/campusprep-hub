const db = require('./db');
const User = require('../models/User');
const Question = require('../models/Question');
const Test = require('../models/Test');
const Company = require('../models/Company');
const Job = require('../models/Job');

const generateId = () => Math.random().toString(36).substring(2, 9);

module.exports = {
  // USER OPERATIONS
  findUserByEmail: async (email) => {
    if (db.isOffline()) {
      const data = db.getOfflineData();
      return data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
    return await User.findOne({ email });
  },

  findUserById: async (id) => {
    if (db.isOffline()) {
      const data = db.getOfflineData();
      const found = data.users.find(u => u._id === id || u.id === id);
      return found || null;
    }
    return await User.findById(id);
  },

  createUser: async (userData) => {
    if (db.isOffline()) {
      const data = db.getOfflineData();
      const generatedId = generateId();
      const newUser = {
        _id: generatedId,
        id: generatedId,
        ...userData,
        isOnboarded: false,
        streak: 1,
        lastActive: new Date().toISOString(),
        profile: {
          fullName: userData.fullName || '',
          collegeName: '',
          branch: '',
          academicYear: '',
          cgpa: 0,
          skills: [],
          targetCompanies: []
        },
        assessment: { aptitude: 0, dsa: 0, dbms: 0, os: 0, cn: 0, oop: 0, communication: 0 },
        goal: '',
        roadmap: {
          placementReadinessScore: 0,
          strengths: [],
          weakAreas: [],
          recommendedLearningPath: [],
          weeklyStudyPlan: [],
          estimatedTimeline: ''
        },
        progress: { aptitude: 0, dsa: 0, dbms: 0, os: 0, cn: 0, oop: 0, completedTasks: [] },
        activity: [{ date: new Date().toISOString(), action: 'Account Created', details: 'Welcome to CampusPrep Hub!' }]
      };
      data.users.push(newUser);
      db.saveOfflineData(data);
      return newUser;
    }
    const user = new User(userData);
    return await user.save();
  },

  updateUser: async (id, updateFields) => {
    if (db.isOffline()) {
      const data = db.getOfflineData();
      const index = data.users.findIndex(u => u._id === id || u.id === id);
      if (index === -1) return null;
      
      const current = data.users[index];
      
      // Perform standard properties assignment
      const updated = {
        ...current,
        ...updateFields
      };
      
      // Handle deeper nesting merging if elements are specified in updateFields
      if (updateFields.profile) {
        updated.profile = { ...current.profile, ...updateFields.profile };
      }
      if (updateFields.assessment) {
        updated.assessment = { ...current.assessment, ...updateFields.assessment };
      }
      if (updateFields.roadmap) {
        updated.roadmap = { ...current.roadmap, ...updateFields.roadmap };
      }
      if (updateFields.progress) {
        updated.progress = { ...current.progress, ...updateFields.progress };
      }
      
      // Handle activity array pushing
      if (updateFields.activity) {
        const currentActivities = current.activity || [];
        // Add default dates if missing
        const newActivities = Array.isArray(updateFields.activity) 
          ? updateFields.activity.map(a => ({ date: new Date().toISOString(), ...a }))
          : [{ date: new Date().toISOString(), ...updateFields.activity }];
          
        updated.activity = [...currentActivities, ...newActivities];
      }
      
      data.users[index] = updated;
      db.saveOfflineData(data);
      return updated;
    }
    
    // Convert arrays or subdocuments properly for Mongo update operator
    const mongoUpdate = {};
    for (const key of Object.keys(updateFields)) {
      if (typeof updateFields[key] === 'object' && updateFields[key] !== null && !Array.isArray(updateFields[key]) && key !== 'activity') {
        for (const subKey of Object.keys(updateFields[key])) {
          mongoUpdate[`${key}.${subKey}`] = updateFields[key][subKey];
        }
      } else if (key === 'activity') {
        if (!mongoUpdate['$push']) mongoUpdate['$push'] = {};
        mongoUpdate['$push'].activity = Array.isArray(updateFields.activity) 
          ? { $each: updateFields.activity } 
          : updateFields.activity;
      } else {
        mongoUpdate[key] = updateFields[key];
      }
    }
    
    // If we are doing simple properties
    let updateQuery = { $set: mongoUpdate };
    if (mongoUpdate['$push']) {
      const { $push, ...setObj } = mongoUpdate;
      updateQuery = { $set: setObj, $push };
    }
    
    return await User.findByIdAndUpdate(id, updateQuery, { new: true });
  },

  // QUESTIONS
  getQuestions: async (query = {}) => {
    if (db.isOffline()) {
      const data = db.getOfflineData();
      let results = data.questions || [];
      if (query.category) {
        results = results.filter(q => q.category.toLowerCase() === query.category.toLowerCase());
      }
      if (query.subCategory) {
        results = results.filter(q => q.subCategory.toLowerCase() === query.subCategory.toLowerCase());
      }
      return results;
    }
    return await Question.find(query);
  },

  getCodingProblems: async (query = {}) => {
    if (db.isOffline()) {
      const data = db.getOfflineData();
      let results = data.codingProblems || [];
      if (query.category) {
        results = results.filter(p => p.category.toLowerCase() === query.category.toLowerCase());
      }
      return results;
    }
    return [];
  },

  getInterviewBank: async (query = {}) => {
    if (db.isOffline()) {
      const data = db.getOfflineData();
      let results = data.interviewBank || [];
      if (query.category) {
        results = results.filter(q => q.category.toLowerCase() === query.category.toLowerCase());
      }
      return results;
    }
    return [];
  },

  // TESTS
  getTests: async () => {
    if (db.isOffline()) {
      const data = db.getOfflineData();
      return data.tests || [];
    }
    return await Test.find();
  },

  getTestById: async (id) => {
    if (db.isOffline()) {
      const data = db.getOfflineData();
      return data.tests.find(t => t._id === id || t.id === id) || null;
    }
    return await Test.findById(id);
  },

  // COMPANIES
  getCompanies: async () => {
    if (db.isOffline()) {
      const data = db.getOfflineData();
      return data.companies || [];
    }
    return await Company.find();
  },

  getCompanyById: async (id) => {
    if (db.isOffline()) {
      const data = db.getOfflineData();
      return data.companies.find(c => c._id === id || c.id === id) || null;
    }
    return await Company.findById(id);
  },

  // JOBS
  getJobs: async () => {
    if (db.isOffline()) {
      const data = db.getOfflineData();
      return data.jobs || [];
    }
    return await Job.find();
  },
  
  applyJob: async (jobId) => {
    if (db.isOffline()) {
      const data = db.getOfflineData();
      const job = data.jobs.find(j => j._id === jobId || j.id === jobId);
      if (job) {
        job.applicantsCount = (job.applicantsCount || 0) + 1;
        db.saveOfflineData(data);
        return job;
      }
      return null;
    }
    return await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } }, { new: true });
  }
};
