const mongoose = require('mongoose');

const PlantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plant name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Air Purifying Plants',
        'Aromatic Fragrant Plants',
        'Insect Repellent Plants',
        'Medicinal Plants',
        'Low Maintenance Plants',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 10,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    // ── Optimistic Concurrency Control ──────────────────────────────
    // Every successful purchase increments this. The client sends the
    // version it last saw; if it doesn't match, the purchase is rejected.
    version: {
      type: Number,
      default: 0,
    },
    // ────────────────────────────────────────────────────────────────
    producer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false } // disable __v, using our own `version`
);

// Index for faster queries
PlantSchema.index({ producer: 1 });
PlantSchema.index({ category: 1 });
PlantSchema.index({ isActive: 1 });

module.exports = mongoose.model('Plant', PlantSchema);
