const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbHelper = require('../config/dbHelper');

// Helper to sign JWT token
const signToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'campusprep_secret_key_12345';
  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Check if user already exists
    const existingUser = await dbHelper.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered with this email' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user record
    const newUser = await dbHelper.createUser({
      email,
      password: hashedPassword
    });

    // Generate JWT
    const token = signToken(newUser._id || newUser.id);

    res.status(201).json({
      token,
      user: {
        id: newUser._id || newUser.id,
        email: newUser.email,
        isOnboarded: newUser.isOnboarded
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find user
    const user = await dbHelper.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = signToken(user._id || user.id);

    // Update streak logic
    const today = new Date();
    const lastActiveDate = user.lastActive ? new Date(user.lastActive) : today;
    const diffTime = Math.abs(today - lastActiveDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let newStreak = user.streak || 1;
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1; // reset streak if missed a day
    }

    await dbHelper.updateUser(user._id || user.id, {
      lastActive: today.toISOString(),
      streak: newStreak,
      activity: [{ action: 'Logged In', details: 'User successfully logged in.' }]
    });

    res.json({
      token,
      user: {
        id: user._id || user.id,
        email: user.email,
        isOnboarded: user.isOnboarded
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await dbHelper.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User details not found' });
    }
    
    // Omit password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword._doc || userWithoutPassword);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error fetching user details' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updated = await dbHelper.updateUser(req.user.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
