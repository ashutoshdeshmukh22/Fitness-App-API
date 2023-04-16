// Importing User Model
const User = require('../models/user.model');

exports.isAuth = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({
      message: 'User is Not Authenticated, Please Login',
    });
  }
  next();
};

exports.checkRole = (roles) => async (req, res, next) => {
  //retrieve employee info from DB
  const user = await User.findOne({ email: req.session.user.email });
  !roles.includes(user.role)
    ? res
        .status(401)
        .json({ messae: 'Sorry you do not have access to this route' })
    : next();
};
