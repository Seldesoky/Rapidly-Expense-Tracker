const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const methodOverride = require('method-override');
const morgan = require('morgan');
require('dotenv').config();

const User = require('./models/User');
const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

const userRoutes = require('./routes/users');
const expenseRoutes = require('./routes/expenses');

app.use('/users', userRoutes);
app.use('/expenses', expenseRoutes);

// Set view EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
