const mongoose = require('mongoose');
const promisify = require('es6-promisify');

const User = mongoose.model('User');

exports.loginForm = (req, res) => res.render('login', { title: 'Login' });

exports.registerForm = (req, res) =>
  res.render('register', { title: 'Register' });

exports.validateRegister = (req, res, next) => {
  req.checkBody('name', 'Please enter your name!').notEmpty();
  req.checkBody('email', 'Invalid email!').isEmail();
  req.checkBody('password', 'Password cannot be blank!').notEmpty();
  req
    .checkBody('password-confirm', 'Oops! Your passwords do not match!')
    .notEmpty()
    .equals(req.body.password);
  req.sanitizeBody('name');
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    return res.render('register', {
      title: 'Register',
      body: req.body,
      flashes: req.flash(),
    });
  }
  return next();
};

exports.register = async (req, res, next) => {
  const { email, name, password } = req.body;
  const user = new User({ email, name });
  const register = promisify(User.register, User);
  await register(user, password);
  return next();
};

exports.account = (req, res) =>
  res.render('account', { title: 'Edit your Account' });

exports.updateAccount = async (req, res) => {
  const { email, name } = req.body;
  const user = await User.findOneAndUpdate(
    // eslint-disable-next-line no-underscore-dangle
    { _id: req.user._id },
    { $set: { email, name } },
    { new: true, runValidators: true, context: 'query' }
  );
  req.flash('success', `Successfully updated profile for ${user.name}! 👍`);
  res.redirect('back');
};
