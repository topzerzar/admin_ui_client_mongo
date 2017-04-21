require('dotenv').config();
const amqp = require('amqplib/callback_api');
const subscriber = require('./subscribe');

const authen = `${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}`;
const host = `${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
const server = `amqp://${authen}@${host}`;

exports.connect = () => {
  amqp.connect(server, (error, connection) => {
    console.log('subscriber');
    subscriber.receiver(connection);
  });
};
