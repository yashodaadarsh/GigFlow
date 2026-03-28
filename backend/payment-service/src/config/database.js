require('dotenv').config();
const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
    process.env.DB_NAME || 'gigflow_payments',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            createDatabaseIfNotExist: true,
        },
    }
);
