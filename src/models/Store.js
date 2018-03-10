const mongoose = require('mongoose');
const slug = require('slugs');

mongoose.Promise = global.Promise;

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name',
  },
  slug: String,
  description: {
    type: String,
    trim: true,
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [
      {
        type: Number,
        required: 'You must supply location coordinates',
      },
    ],
    address: {
      type: String,
      required: 'You must supply an address',
    },
  },
  photo: String,
});

storeSchema.pre('save', async function slugGenerator(next) {
  if (this.isModified('name')) {
    const thisSlug = slug(this.name);
    const slugRegEx = new RegExp(`^(${thisSlug})((-[1-9]*$)?)$`, 'i');
    const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
    this.slug = storesWithSlug.length
      ? `${thisSlug}-${storesWithSlug.length}`
      : thisSlug;
  }
  return next();
});

storeSchema.statics.getTagList = function tagListAggregator() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

module.exports = mongoose.model('Store', storeSchema);
