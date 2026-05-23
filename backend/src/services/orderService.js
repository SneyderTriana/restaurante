const { Order, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const emailService = require('./emailService');

class OrderService {
  async create(orderData) {
    const { items, orderType, specialInstructions, userId, reservationId } = orderData;
    
    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = await Order.create({
      userId,
      reservationId,
      items,
      totalAmount,
      orderType,
      specialInstructions,
      status: 'pending',
      estimatedTime: this.calculateEstimatedTime(items)
    });

    // Send order confirmation
    const user = await User.findByPk(userId);
    if (user) {
      await emailService.sendOrderConfirmation(user.email, order);
    }

    return order;
  }

  async getUserOrders(userId) {
    return await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }

  async getById(orderId, userId, userRole) {
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized to view this order');
    }

    return order;
  }

  async updateStatus(orderId, status) {
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    order.status = status;
    await order.save();

    // Notify user of status change
    const user = await User.findByPk(order.userId);
    if (user) {
      await emailService.sendOrderStatusUpdate(user.email, order);
    }

    return order;
  }

  calculateEstimatedTime(items) {
    // Calculate based on items complexity
    const baseTime = 15; // minutes
    const itemTime = items.reduce((sum, item) => sum + (item.quantity * 5), 0);
    return Math.min(baseTime + itemTime, 60); // Max 60 minutes
  }
}

module.exports = new OrderService();