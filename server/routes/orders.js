const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const { verifyToken, requireRole } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/checkout
// Consumer purchases cart items using Optimistic Concurrency Control (OCC).
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/checkout',
  verifyToken,
  requireRole('consumer'),
  async (req, res) => {
    const { items, shippingAddress } = req.body;

    if (!shippingAddress || shippingAddress.trim() === '') {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    try {
      const orderItems = [];
      let totalAmount = 0;
      const conflictItems = [];
      const plantsToUpdate = [];

      // ── Pass 1: Validation (OCC & Stock) ───────────────────────────────────
      // We do this in two passes because local MongoDB installations often
      // don't support Replica Sets (which are required for Transactions).
      for (const cartItem of items) {
        const { plantId, quantity, version } = cartItem;

        if (!quantity || quantity < 1) {
          return res.status(400).json({ message: 'Invalid quantity' });
        }

        // OCC check: find plant only if version still matches
        const plant = await Plant.findOne({
          _id: plantId,
          version: version, // ← this is the OCC guard
          isActive: true,
        });

        if (!plant) {
          conflictItems.push(plantId);
          continue; // collect all conflicts
        }

        if (plant.stock < quantity) {
          return res.status(400).json({
            message: `Insufficient stock for "${plant.name}". Available: ${plant.stock}`,
            plantId: plant._id,
          });
        }

        plantsToUpdate.push({ plant, quantity });
      }

      // If any item had a version conflict, abort early
      if (conflictItems.length > 0) {
        return res.status(409).json({
          message:
            'Some plants were updated by the seller since you last loaded the page. Please refresh and try again.',
          conflictItems,
        });
      }

      // ── Pass 2: Apply Updates ──────────────────────────────────────────────
      for (const { plant, quantity } of plantsToUpdate) {
        plant.stock -= quantity;
        plant.version += 1;
        await plant.save();

        orderItems.push({
          plant: plant._id,
          plantName: plant.name,
          plantImage: plant.image,
          producerId: plant.producer,
          priceAtPurchase: plant.price,
          quantity,
        });

        totalAmount += plant.price * quantity;
      }

      // ── Create Order ───────────────────────────────────────────────────────
      const order = await Order.create({
        consumer: req.user._id,
        shippingAddress: shippingAddress.trim(),
        items: orderItems,
        totalAmount,
      });

      // ── Audit log ──────────────────────────────────────────────────────────
      await Transaction.create({
        type: 'purchase',
        actor: req.user._id,
        actorName: req.user.name,
        actorRole: 'consumer',
        orderId: order._id,
        detail: `Consumer "${req.user.name}" purchased ${orderItems.length} item(s) for $${totalAmount.toFixed(2)}`,
        amount: totalAmount,
      });

      res.status(201).json({
        message: 'Order placed successfully!',
        order,
      });
    } catch (err) {
      console.error('Checkout error:', err);
      res.status(500).json({ message: 'Checkout failed', error: err.message });
    }
  }
);

// ── GET /api/orders/mine  — Consumer's order history ─────────────────────
router.get('/mine', verifyToken, requireRole('consumer'), async (req, res) => {
  try {
    const orders = await Order.find({ consumer: req.user._id })
      .populate('items.plant', 'name image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
