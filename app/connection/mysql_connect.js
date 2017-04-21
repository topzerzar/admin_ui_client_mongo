const mysql = require('mysql');
require('dotenv').config();

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DATABASE_IP,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: 'Employers_JobThai',
});

module.exports = {
  query: queryString => (
    new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        connection.query(queryString, (error, results, fields) => {
          connection.release();
          if (error) reject(error);
          resolve(results);
        });
      });
    })
  ),
  close: () => {
    console.log('close connection');
    pool.end();
  },
};
