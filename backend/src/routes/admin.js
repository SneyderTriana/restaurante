const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/reservations', adminController.getAllReservations);
router.get('/orders', adminController.getAllOrders);
router.get('/reports', adminController.generateReports);
router.get('/dashboard/stats', adminController.getDashboardStats);

module.exports = router;