const { Reservation, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const emailService = require('./emailService');

class ReservationService {
  async create(reservationData) {
    const { reservationDate, reservationTime, partySize, userId, specialRequests } = reservationData;
    
    // Check availability
    const isAvailable = await this.checkAvailability(reservationDate, reservationTime, partySize);
    if (!isAvailable) {
      throw new Error('No tables available for the selected time');
    }

    // Create reservation
    const reservation = await Reservation.create({
      userId,
      reservationDate,
      reservationTime,
      partySize,
      specialRequests,
      status: 'confirmed'
    });

    // Send confirmation email
    const user = await User.findByPk(userId);
    if (user) {
      await emailService.sendReservationConfirmation(user.email, reservation);
    }

    return reservation;
  }

  async getUserReservations(userId) {
    return await Reservation.findAll({
      where: { userId },
      order: [['reservationDate', 'DESC'], ['reservationTime', 'ASC']]
    });
  }

  async checkAvailability(date, time, partySize) {
    // Check existing reservations for the same time slot
    const existingReservations = await Reservation.count({
      where: {
        reservationDate: date,
        reservationTime: time,
        status: { [Op.ne]: 'cancelled' }
      }
    });

    // Assuming restaurant has 15 tables
    const TOTAL_TABLES = 15;
    const availableTables = TOTAL_TABLES - existingReservations;

    return availableTables >= Math.ceil(partySize / 4);
  }

  async cancel(reservationId, userId, userRole) {
    const reservation = await Reservation.findByPk(reservationId);
    
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.userId !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized to cancel this reservation');
    }

    if (reservation.status === 'cancelled') {
      throw new Error('Reservation already cancelled');
    }

    reservation.status = 'cancelled';
    await reservation.save();

    return reservation;
  }

  async getById(reservationId, userId, userRole) {
    const reservation = await Reservation.findByPk(reservationId);
    
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.userId !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized to view this reservation');
    }

    return reservation;
  }
}

module.exports = new ReservationService();