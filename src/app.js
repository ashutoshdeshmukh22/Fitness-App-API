// Configuring Environment Variables
require('dotenv').config();

// Dependencies
const express = require('express');
const db = require('./config/db');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

//importing Routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');

// Configuring PORT
const PORT = process.env.PORT || 2000;

// Connecting To Database - FitnessApp
db.connect();

// Creating Express App Instance
const app = express();

// Creating store for storing session
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions',
});

// Using Session
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use(express.json());

// Using the Auth Routes
app.use(authRoutes);
// Using the Admin Routes
app.use('/admin', adminRoutes);
// Using The User Routes
app.use('/user', userRoutes);

app.listen(PORT, () => {
  console.log(`App Listening on ${PORT}`);
});
