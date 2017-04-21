require('dotenv').config();
const db = require('../connection/mongo_connect');

module.exports = {
  create: (data) => {
    const collection = db.get().collection('logpumping');
    const getNextSequence = module.exports.getNextSequence('running_number');
    return getNextSequence.then((result) => {
      const newdata = Object.assign({}, { _id: result.value.seq }, data);
      return collection.insert(newdata);
    });
  },
  getNextSequence: (name) => {
    const collectionCounter = db.get().collection('counters');
    return collectionCounter.findOneAndUpdate(
      { _id: name },
      {
        $inc: { seq: 1 },
      },
      { new: true }
    );
  },
  updateIntervalTime: (id, type, value) => {
    const collection = db.get().collection('logpumping');
    const target = value;
    const field = type;
    const obj = {};
    obj[field] = target;
    return collection.findOneAndUpdate(
      {
        "_id": id 
      },
      {
        $set: obj,
      }
    );
  },
};
