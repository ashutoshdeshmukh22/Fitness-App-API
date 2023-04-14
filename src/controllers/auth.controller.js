const bcrypt = require('bcryptjs');

// Importing User Model
const User = require('../models/user.model');

// Handling Sign UpLogic
exports.postSignup = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!(username && email && password && role)) {
      res.status(400).send('All input is required');
    }

    // check if user already exist Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).json({
        message: 'User Already Exist. Please Login',
      });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 8);

    // Create user in our database
    const user = await User.create({
      username: username,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      role: role,
    });

    const result = await user.save();

    // return new user
    res.status(201).json({
      message: 'User Account Created Successfully',
      user: result,
    });
  } catch (err) {
    console.log(err);
  }
};

// Handling Login Logic
exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).json({ message: 'All input is required' });
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'Email does not exist' });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      return res.status(200).json({
        message: 'User Logged In',
        user: user,
      });
    }
    res.status(400).send('Invalid Credentials');
  } catch (err) {
    console.log(err);
  }
};

exports.logOut = async (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.status(200).json({ message: 'User Logout Success' });
  });
};
