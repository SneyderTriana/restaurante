const { User, Reservation, Order, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class AdminService {
  async getAllUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      users: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  async updateUser(userId, updateData) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent role change for last admin
    if (updateData.role && updateData.role !== user.role) {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount === 1 && user.role === 'admin') {
        throw new Error('Cannot change role of the last admin user');
      }
    }

    await user.update(updateData);
    
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }

  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent deletion of last admin
    if (user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount === 1) {
        throw new Error('Cannot delete the last admin user');
      }
    }

    await user.destroy();
    return true;
  }

  async getAllReservations(page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;
    const where = status ? { status } : {};

    const { count, rows } = await Reservation.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }],
      limit,
      offset,
      order: [['reservationDate', 'DESC']]
    });

    return {
      reservations: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  async getAllOrders(page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;
    const where = status ? { status } : {};

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      orders: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  async generateReport(startDate, endDate, type) {
    const where = {
      createdAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };

    let data;
    switch (type) {
      case 'orders':
        data = await Order.findAll({
          where,
          attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue']
          ],
          group: [sequelize.fn('DATE', sequelize.col('createdAt'))]
        });
        break;
      case 'reservations':
        data = await Reservation.findAll({
          where,
          attributes: [
            [sequelize.fn('DATE', sequelize.col('reservationDate')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: [sequelize.fn('DATE', sequelize.col('reservationDate'))]
        });
        break;
      default:
        throw new Error('Invalid report type');
    }

    return {
      type,
      startDate,
      endDate,
      data,
      generatedAt: new Date()
    };
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    
    const [totalUsers, totalOrders, totalReservations, todayOrders, pendingOrders] = await Promise.all([
      User.count(),
      Order.count(),
      Reservation.count(),
      Order.count({ where: { createdAt: { [Op.gte]: startOfDay } } }),
      Order.count({ where: { status: 'pending' } })
    ]);

    return {
      totalUsers,
      totalOrders,
      totalReservations,
      todayOrders,
      pendingOrders,
      revenue: await Order.sum('totalAmount'),
      averageOrderValue: await Order.average('totalAmount')
    };
  }
}

module.exports = new AdminService();