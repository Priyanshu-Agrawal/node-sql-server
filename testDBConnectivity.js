const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {// Use Windows Authentication
      encrypt: false, // Use this if you're on Azure
    },
  };

sql.connect(config)
    .then(() => {
        console.log('Connection Successfull');

        // Define your SQL query
        // const query = 'SELECT * FROM class'; // Replace YourTableName with the actual table name

        // Execute the query
        // return sql.query(query);
    })
    .then((result) => {
        // console.log('Query Result:', result.recordset);
    })
    .catch((err) => {
        console.error('Error:', err);
    });

