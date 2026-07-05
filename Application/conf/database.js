var mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectTimeout: 15000,
    //idleTimeout: 10000 *60*10,   //commented it for debugging
    connectionLimit: 20,
    queueLimit: 0    //for debugging
});

module.exports = pool.promise();