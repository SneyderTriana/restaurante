const orderService = require('../services/orderService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class OrderController {
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const order = await orderService.create({
        ...req.body,
        userId: req.user.id
      });

      res.status(201).json({ success: true, order });
    } catch (error) {
      logger.error('Create order error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getMyOrders(req, res) {
    try {
      const orders = await orderService.getUserOrders(req.user.id);
      res.json({ success: true, orders });
    } catch (error) {
      logger.error('Get orders error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const order = await orderService.getById(req.params.id, req.user.id, req.user.role);
      res.json({ success: true, order });
    } catch (error) {
      logger.error('Get order error:', error);
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const order = await orderService.updateStatus(req.params.id, status);
      res.json({ success: true, order });
    } catch (error) {
      logger.error('Update order status error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new OrderController();