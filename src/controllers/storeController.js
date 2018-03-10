const mongoose = require('mongoose');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    return isPhoto
      ? next(null, true)
      : next({ message: 'That filetype is not allowed' }, false);
  },
};

const Store = mongoose.model('Store');

exports.homePage = (req, res) => res.render('index');

exports.addStore = (req, res) =>
  res.render('editStore', { title: 'Add Store' });

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  if (req.file) {
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
  }
  return next();
};

exports.createStore = async (req, res) => {
  const storeInfo = new Store(req.body);
  const store = await storeInfo.save();
  req.flash(
    'success',
    `Successfully created <strong>${
      store.name
    }</strong>. Care to leave a review?`
  );
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores });
};

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });
  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  req.body.location.type = 'Point';
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  }).exec();
  req.flash(
    'success',
    `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${
      store.slug
    }">View Store ▶️</a>`
  );
  // eslint-disable-next-line no-underscore-dangle
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug });
  return store ? res.render('store', { store, title: store.name }) : next();
};

exports.getStoresByTag = async (req, res) => {
  const { tag } = req.params;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render('tag', { tags, tag, stores });
};
