const mysql = require('mysql2');

const pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : 'Unknown@123',
    database : 'complaint',
    port : 3306
});

module.exports = pool.promise();