require('dotenv').config();
const tranformData = require('../data/tranformData');
const LogPumpingModel = require('../models/LogPumpingModel');
const commonFunctions = require('../commons/commonFunctions');

function jsonEscape(str) {
  return str.replace(/\n/g, '\\\\n').replace(/\r/g, '\\\\r').replace(/\t/g, '\\\\t');
}

const queue = `${process.env.RABBITMQ_QUEUE}`;
exports.receiver = (connection) => {
  connection.createChannel((err, ch) => {
    ch.assertQueue(queue, { durable: true }, () => {
      ch.consume(queue, (msg) => {
        const start = commonFunctions.getDate();
        const message = msg.content.toString();
        const messageEscape = JSON.parse(jsonEscape(message));
        tranformData.tranform(messageEscape).then((res) => {
          const id = res.value._id;
          const end = commonFunctions.getDate();
          const time = commonFunctions.calculateTime(start, end);
          LogPumpingModel.updateIntervalTime(id, 'data.consumeTime', time);
        });
      }, { noAck: true });
    });
  });
};
