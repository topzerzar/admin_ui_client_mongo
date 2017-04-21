require('dotenv').config();

const express = require('express');
const db = require('./app/connection/mongo_connect');
const commonFunctions = require('./app/commons/commonFunctions');

const app = express();
const port = process.env.NODE_PORT || 8080;
const task = process.env.NODE_ENV || 'development';

if (task !== 'test') {
  app.listen(port);
}

db.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT || 27017}/${process.env.MONGO_DATABASE}`, () => {
  commonFunctions.setupCouters();
});

module.exports = app;
