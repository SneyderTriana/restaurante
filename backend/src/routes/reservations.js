const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');

const reservationValidation = [
  body('reservationDate').isISO8601(),
  body('reservationTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('partySize').isInt({ min: 1, max: 20 }),
  body('specialRequests').optional().isLength({ max: 500 })
];

router.use(authenticate);
router.post('/', reservationValidation, reservationController.create);
router.get('/my', reservationController.getMyReservations);
router.get('/availability', reservationController.checkAvailability);
router.put('/:id/cancel', reservationController.cancel);
router.get('/:id', reservationController.getById);

module.exports = router;