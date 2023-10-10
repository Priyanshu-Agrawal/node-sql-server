// config for your database
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST, 
    database: process.env.DB_NAME,
    options: {
        encrypt: false // Disable SSL/TLS encryption
    }
}

module.exports = config