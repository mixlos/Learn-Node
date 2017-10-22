const mongoose = require('mongoose');

const Store = mongoose.model('Store');

exports.homePage = (req, res) => res.render('index');

exports.addStore = (req, res) =>
  res.render('editStore', { title: 'Add Store' });

exports.createStore = async (req, res) => {
  const storeInfo = new Store(req.body);
  const store = await storeInfo.save();
  req.flash(
    'success',
    `Successfully Created ${store.name}. Care to leave a review?`
  );
  res.redirect(`/store/${store.slug}`);
};