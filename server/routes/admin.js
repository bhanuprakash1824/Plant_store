const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Plant = require('../models/Plant');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const { verifyToken, requireRole } = require('../middleware/auth');

// All admin routes are protected — owner only
router.use(verifyToken, requireRole('owner'));

// ── GET /api/admin/stats ───────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducers,
      totalConsumers,
      totalPlants,
      totalOrders,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'owner' } }),
      User.countDocuments({ role: 'producer' }),
      User.countDocuments({ role: 'consumer' }),
      Plant.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    res.json({
      totalUsers,
      totalProducers,
      totalConsumers,
      totalPlants,
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET /api/admin/users ───────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'owner' } }).sort({
      createdAt: -1,
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET /api/admin/plants ──────────────────────────────────────────────────
router.get('/plants', async (req, res) => {
  try {
    const plants = await Plant.find()
      .populate('producer', 'name email businessName')
      .sort({ createdAt: -1 });
    res.json(plants);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET /api/admin/orders ──────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('consumer', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET /api/admin/transactions ────────────────────────────────────────────
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
