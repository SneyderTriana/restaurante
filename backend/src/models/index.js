const sequelize = require('../config/database');
const User = require('./User');
const Reservation = require('./Reservation');
const Order = require('./Order');

// Define associations
User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Reservation.hasOne(Order, { foreignKey: 'reservationId', as: 'order' });
Order.belongsTo(Reservation, { foreignKey: 'reservationId', as: 'reservation' });

module.exports = {
  sequelize,
  User,
  Reservation,
  Order
};