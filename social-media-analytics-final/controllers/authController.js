const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');
console.log('Auth controller loaded');

const register = async (req, res) => {
  console.log('=== REGISTER ROUTE HIT ===');
  console.log('Request body:', req.body);
  
  const { username, email, password } = req.body;
  
  try {
    console.log('Checking for existing user...');
    
    // Check if user exists by email OR username
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      const duplicateField = existingUser.email === email ? 'email' : 'username';
      console.log(`User with this ${duplicateField} already exists`);
      return res.status(400).json({ 
        message: `User with this ${duplicateField} already exists` 
      });
    }

    console.log('Hashing password...');
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Creating new user...');
    // Create user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    console.log('User registered successfully!');

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('=== REGISTER ERROR ===');
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  console.log('=== LOGIN ROUTE HIT ===');
  console.log('Request body:', req.body);
  
  const { email, password } = req.body;
  
  try {
    console.log('Looking for user with email:', email);
    // Find user by email
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('Comparing password...');
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    console.log('Creating JWT token...');
    // Create JWT token
    const payload = { id: user._id, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('Token created successfully');

    res.status(200).json({ token, user: payload });
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = { register, login };
