const { body } = require('express-validator');

/**
 * Validation schemas for different endpoints
 * Implements input sanitization and validation
 */
const userValidationRules = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
      .withMessage('Password must contain at least 1 letter and 1 number'),
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .escape()
      .withMessage('First name must be 2-50 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .escape()
      .withMessage('Last name must be 2-50 characters'),
    body('phone')
      .optional()
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage('Valid phone number is required')
  ],
  
  reservation: [
    body('reservationDate')
      .isISO8601()
      .withMessage('Valid date is required'),
    body('reservationTime')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Time must be in HH:MM format'),
    body('partySize')
      .isInt({ min: 1, max: 20 })
      .withMessage('Party size must be between 1 and 20'),
    body('specialRequests')
      .optional()
      .isLength({ max: 500 })
      .escape()
  ],
  
  order: [
    body('items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required'),
    body('items.*.name')
      .trim()
      .notEmpty()
      .escape(),
    body('items.*.quantity')
      .isInt({ min: 1, max: 99 }),
    body('items.*.price')
      .isFloat({ min: 0 }),
    body('orderType')
      .isIn(['dine-in', 'takeaway', 'delivery'])
  ]
};

module.exports = userValidationRules;