const mongoose = require('mongoose');
const passport = require('passport');
const { randomBytes } = require('crypto');
const promisify = require('es6-promisify');

const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login',
  successRedirect: '/',
  successFlash: 'Login Successful! 👍',
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'Succesfully logged out! 👋');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', '⛔️ You must be logged in to do that! ⛔️');
  return res.redirect('/login');
};

exports.forgot = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    user.resetPasswordToken = randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    const resetUrl = `http://${req.headers.host}/account/reset/${
      user.resetPasswordToken
    }`;
    console.log(resetUrl);
  }
  req.flash('info', `A Password reset link has been emailed to you.`);
  return res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    req.flash('error', `Password reset link is invalid or has expired.`);
    return res.redirect('/login');
  }
  return res.render('reset', { title: 'Reset Password' });
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password && req.body.password === req.body['password-confirm']) {
    return next();
  }
  req.flash('error', `Passwords do not match!`);
  return res.redirect('back');
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    req.flash('error', `Password reset link is invalid or has expired.`);
    return res.redirect('/login');
  }
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash(
    'success',
    'Your password has been reset! You are now logged in! 🕺💃'
  );
  return res.redirect('/');
};
