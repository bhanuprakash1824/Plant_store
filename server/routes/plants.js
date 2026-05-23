const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Plant = require('../models/Plant');
const Transaction = require('../models/Transaction');
const { verifyToken, requireRole } = require('../middleware/auth');

// ── GET /api/plants  — ALL active plants (Consumer + Owner) ────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    const plants = await Plant.find({ isActive: true, stock: { $gt: 0 } })
      .populate('producer', 'name businessName')
      .sort({ createdAt: -1 });
    res.json(plants);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET /api/plants/mine  — Producer's own plants ─────────────────────────
router.get(
  '/mine',
  verifyToken,
  requireRole('producer'),
  async (req, res) => {
    try {
      const plants = await Plant.find({ producer: req.user._id }).sort({
        createdAt: -1,
      });
      res.json(plants);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// ── POST /api/plants  — Producer adds a plant ─────────────────────────────
router.post(
  '/',
  verifyToken,
  requireRole('producer'),
  [
    body('name').notEmpty().withMessage('Plant name required'),
    body('category').notEmpty().withMessage('Category required'),
    body('description').notEmpty().withMessage('Description required'),
    body('image').isURL().withMessage('Valid image URL required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
    body('stock').isInt({ min: 0 }).withMessage('Valid stock count required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const plant = await Plant.create({
        ...req.body,
        producer: req.user._id,
        version: 0,
      });

      // Audit log
      await Transaction.create({
        type: 'listing_add',
        actor: req.user._id,
        actorName: req.user.name,
        actorRole: 'producer',
        plant: plant._id,
        plantName: plant.name,
        detail: `Producer "${req.user.name}" added plant "${plant.name}" at $${plant.price}`,
      });

      res.status(201).json(plant);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// ── PUT /api/plants/:id  — Producer edits own plant ──────────────────────
router.put(
  '/:id',
  verifyToken,
  requireRole('producer'),
  async (req, res) => {
    try {
      const plant = await Plant.findOne({
        _id: req.params.id,
        producer: req.user._id,
      });

      if (!plant) {
        return res
          .status(404)
          .json({ message: 'Plant not found or not yours' });
      }

      const allowed = ['name', 'category', 'description', 'image', 'price', 'stock', 'isActive'];
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) plant[field] = req.body[field];
      });

      // Bump version when stock changes so existing OCC snapshots are invalidated
      if (req.body.stock !== undefined) plant.version += 1;

      await plant.save();

      // Audit log
      await Transaction.create({
        type: 'listing_update',
        actor: req.user._id,
        actorName: req.user.name,
        actorRole: 'producer',
        plant: plant._id,
        plantName: plant.name,
        detail: `Producer "${req.user.name}" updated plant "${plant.name}"`,
      });

      res.json(plant);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// ── DELETE /api/plants/:id  — Producer deletes own plant ─────────────────
router.delete(
  '/:id',
  verifyToken,
  requireRole('producer'),
  async (req, res) => {
    try {
      const plant = await Plant.findOne({
        _id: req.params.id,
        producer: req.user._id,
      });

      if (!plant) {
        return res
          .status(404)
          .json({ message: 'Plant not found or not yours' });
      }

      plant.isActive = false; // soft delete
      await plant.save();

      // Audit log
      await Transaction.create({
        type: 'listing_delete',
        actor: req.user._id,
        actorName: req.user.name,
        actorRole: 'producer',
        plant: plant._id,
        plantName: plant.name,
        detail: `Producer "${req.user.name}" removed plant "${plant.name}"`,
      });

      res.json({ message: 'Plant removed successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

module.exports = router;
