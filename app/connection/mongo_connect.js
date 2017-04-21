require('dotenv').config({ path: `${__dirname}/../../.env` });

// const configMongo = require('../../config/mongo');
// const mongoClient = require('mongodb').MongoClient;

// module.exports = {
//   connect: (callback) => {
//     const database = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT || 27017}/${process.env.MONGO_DATABASE}`;
//     return mongoClient.connect(database, callback);
//   },
// };

const MongoClient = require('mongodb').MongoClient;

const state = {
  db: null,
};

exports.connect = ((url, done) => {
  if (state.db) {
    return done();
  }
  MongoClient.connect(url, (err, db) => {
    if (err) return done(err);
    state.db = db;
    done();
  });
});

exports.get = (() => state.db);

exports.close = ((done) => {
  if (state.db) {
    state.db.close((err, result) => {
      state.db = null;
      state.mode = null;
      done(err);
    });
  }
});
