const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
    id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    gig_id:               { type: DataTypes.STRING, allowNull: false },
    hirer_id:             { type: DataTypes.STRING, allowNull: false },
    bidder_id:            { type: DataTypes.STRING, allowNull: false },
    amount:               { type: DataTypes.DOUBLE, allowNull: false },
    status:               { type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED'), defaultValue: 'PENDING' },
    razorpay_order_id:    { type: DataTypes.STRING },
    razorpay_payment_id:  { type: DataTypes.STRING },
    razorpay_signature:   { type: DataTypes.STRING },
}, { tableName: 'payments' });

module.exports = Payment;
