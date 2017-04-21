
const db = require('../connection/mongo_connect');

module.exports = {
  calculateTime: ((start, end) => (start.getTime() - end.getTime()) * -1),
  getDate: (() => new Date()),
  setupCouters: (() => {
    const collectionCounter = db.get().collection('counters');
    collectionCounter.findOne({ _id: 'running_number' }, (document) => {
    if (document == null) { collectionCounter.insert({ _id: 'running_number', seq: 1 }); }
  });
  }),
};
