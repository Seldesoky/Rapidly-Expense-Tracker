const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');

// Show registration form
router.get('/register', (req, res) => {
  res.render('register');
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username });
    await User.register(user, password);
    req.flash('success', 'Registration successful. Please log in.');
    res.redirect('/users/login');
  } catch (err) {
    req.flash('error', 'Error registering user.');
    res.redirect('/users/register');
  }
});

// Show login form
router.get('/login', (req, res) => {
  res.render('login');
});

// Log in a user
router.post('/login', passport.authenticate('local', {
  successRedirect: '/expenses',
  failureRedirect: '/users/login',
  failureFlash: true
}));

// Log out a user
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Logged out successfully.');
  res.redirect('/users/login');
});

module.exports = router;
