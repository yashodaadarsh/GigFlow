const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatRoom = sequelize.define('ChatRoom', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  gig_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hirer_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bidder_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['gig_id', 'bidder_id']
    }
  ]
});

module.exports = ChatRoom;
