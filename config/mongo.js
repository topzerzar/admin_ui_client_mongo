module.exports = {
  db: {
    host: (process.env.MONGO_HOST || 'localhost'),
    database: process.env.MONGO_DATABASE,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
  },
};
