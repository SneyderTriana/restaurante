const authService = require('../services/authService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Authentication controller handling HTTP requests for auth operations
 */
class AuthController {
  /**
   * Register new user
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, token } = await authService.register(req.body);
      res.status(201).json({ success: true, user, token });
    } catch (error) {
      logger.error('Register controller error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Login user
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      res.json({ success: true, user, token });
    } catch (error) {
      logger.error('Login controller error:', error);
      res.status(401).json({ success: false, message: error.message });
    }
  }

  /**
   * Get current authenticated user
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });
      res.json({ success: true, user });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();