const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ChatRoom = require('./ChatRoom');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sender_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  message_type: {
    type: DataTypes.ENUM('TEXT', 'SYSTEM'),
    defaultValue: 'TEXT',
  }
}, {
  timestamps: true,
});

// Relationships
Message.belongsTo(ChatRoom, { foreignKey: 'room_id', targetKey: 'id', as: 'room', onDelete: 'CASCADE' });
ChatRoom.hasMany(Message, { foreignKey: 'room_id', as: 'messages' });

module.exports = Message;
