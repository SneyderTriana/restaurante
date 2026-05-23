const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { body } = require('express-validator');

const orderValidation = [
  body('items').isArray({ min: 1 }),
  body('items.*.name').notEmpty().trim(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.price').isFloat({ min: 0 }),
  body('orderType').isIn(['dine-in', 'takeaway', 'delivery'])
];

router.use(authenticate);
router.post('/', orderValidation, orderController.create);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getById);
router.put('/:id/status', authorize('admin'), orderController.updateStatus);

module.exports = router;