const mysql = require('mysql2/promise')

async function getConnection() {
    const rootConnection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS lumel_assessment`);
    await rootConnection.end();
   
    return await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'lumel_assessment'
    })
}

module.exports = getConnection
