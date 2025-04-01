const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { validateRegister, validateLogin } = require('../validations/auth.validation');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    const validatedData = validateRegister(req.body);
    console.log('Validated data:', validatedData);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      userId: validatedData.email // Using email as userId for now
    });

    console.log('Created user object:', user);
    await user.save();
    console.log('User saved successfully');

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map(err => err.message) });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const validatedData = validateLogin(req.body);

    // Find user
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(validatedData.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors });
    }
    res.status(500).json({ message: 'Error logging in' });
  }
});

module.exports = router; 