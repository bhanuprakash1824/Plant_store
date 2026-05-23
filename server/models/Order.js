const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true,
  },
  plantName: String, // snapshot at purchase time
  plantImage: String,
  producerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  priceAtPurchase: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'cancelled'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

OrderSchema.index({ consumer: 1 });

module.exports = mongoose.model('Order', OrderSchema);
