const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    // 'purchase' = consumer bought | 'listing_add' = producer added a plant
    // 'listing_update' = producer edited | 'listing_delete' = producer deleted
    type: {
      type: String,
      enum: ['purchase', 'listing_add', 'listing_update', 'listing_delete'],
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorName: String,   // snapshot so owner log stays readable
    actorRole: String,
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
    },
    plantName: String,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    detail: String,      // human-readable summary
    amount: Number,      // for purchases: total amount
  },
  { timestamps: true }
);

TransactionSchema.index({ type: 1 });
TransactionSchema.index({ actor: 1 });
TransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
