const reservationService = require('../services/reservationService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class ReservationController {
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const reservation = await reservationService.create({
        ...req.body,
        userId: req.user.id
      });

      res.status(201).json({ success: true, reservation });
    } catch (error) {
      logger.error('Create reservation error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getMyReservations(req, res) {
    try {
      const reservations = await reservationService.getUserReservations(req.user.id);
      res.json({ success: true, reservations });
    } catch (error) {
      logger.error('Get reservations error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async checkAvailability(req, res) {
    try {
      const { date, time, partySize } = req.query;
      const available = await reservationService.checkAvailability(date, time, partySize);
      res.json({ success: true, available });
    } catch (error) {
      logger.error('Check availability error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async cancel(req, res) {
    try {
      const reservation = await reservationService.cancel(req.params.id, req.user.id, req.user.role);
      res.json({ success: true, reservation });
    } catch (error) {
      logger.error('Cancel reservation error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const reservation = await reservationService.getById(req.params.id, req.user.id, req.user.role);
      res.json({ success: true, reservation });
    } catch (error) {
      logger.error('Get reservation error:', error);
      res.status(404).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ReservationController();