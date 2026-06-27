const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isOffline = false;
const fallbackDbPath = path.join(__dirname, '../data/db.json');

// Ensure data directory and default db.json exists
if (!fs.existsSync(path.dirname(fallbackDbPath))) {
  fs.mkdirSync(path.dirname(fallbackDbPath), { recursive: true });
}
if (!fs.existsSync(fallbackDbPath)) {
  fs.writeFileSync(fallbackDbPath, JSON.stringify({
    users: [],
    questions: [],
    tests: [],
    companies: [],
    jobs: []
  }, null, 2));
}

const connectDB = async () => {
  if (process.env.USE_JSON_DB === 'true') {
    isOffline = true;
    console.log('CampusPrep Hub is running in explicit JSON Database Mode.');
    console.log(`Offline data storage: ${fallbackDbPath}`);
    return;
  }

  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusprep';
    console.log(`Connecting to MongoDB at: ${connUri}...`);
    // Set a fast connection timeout so we fail over immediately if MongoDB isn't running
    await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB connection established successfully.');
  } catch (err) {
    console.log('--- DB CONNECTION NOTICE ---');
    console.log('MongoDB daemon not detected or failed to connect.');
    console.log('CampusPrep Hub is running in fallback JSON Database Mode.');
    console.log(`Offline data storage: ${fallbackDbPath}`);
    console.log('----------------------------');
    isOffline = true;
  }
};

const getOfflineData = () => {
  try {
    if (!fs.existsSync(fallbackDbPath)) {
      return { users: [], questions: [], tests: [], companies: [], jobs: [] };
    }
    const raw = fs.readFileSync(fallbackDbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading JSON fallback database:', err);
    return { users: [], questions: [], tests: [], companies: [], jobs: [] };
  }
};

const saveOfflineData = (data) => {
  try {
    fs.writeFileSync(fallbackDbPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving JSON fallback database:', err);
  }
};

module.exports = {
  connectDB,
  isOffline: () => isOffline,
  getOfflineData,
  saveOfflineData
};
