const adminService = require('../services/adminService');
const logger = require('../utils/logger');

class AdminController {
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const users = await adminService.getAllUsers(parseInt(page), parseInt(limit));
      res.json({ success: true, ...users });
    } catch (error) {
      logger.error('Get all users error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const user = await adminService.updateUser(req.params.id, req.body);
      res.json({ success: true, user });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      await adminService.deleteUser(req.params.id);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      logger.error('Delete user error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllReservations(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const reservations = await adminService.getAllReservations(
        parseInt(page), 
        parseInt(limit), 
        status
      );
      res.json({ success: true, ...reservations });
    } catch (error) {
      logger.error('Get all reservations error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllOrders(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const orders = await adminService.getAllOrders(parseInt(page), parseInt(limit), status);
      res.json({ success: true, ...orders });
    } catch (error) {
      logger.error('Get all orders error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async generateReports(req, res) {
    try {
      const { startDate, endDate, type } = req.query;
      const report = await adminService.generateReport(startDate, endDate, type);
      res.json({ success: true, report });
    } catch (error) {
      logger.error('Generate report error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDashboardStats(req, res) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json({ success: true, stats });
    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AdminController();