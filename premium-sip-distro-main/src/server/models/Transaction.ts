import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  date: { type: String, required: true }, // Formatted date string or use timestamps
  time: { type: String, required: true },
  user: { type: String, required: true }, // User name or ID
  action: { 
    type: String, 
    required: true,
    enum: [
      'Order Created', 
      'Status Changed', 
      'Payment Confirmed', 
      'Delivery Confirmed', 
      'Inventory Reduction',
      'Order Cancelled'
    ]
  },
  description: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orderNumber: { type: String }
}, { timestamps: true });

export const Transaction = mongoose.model('Transaction', transactionSchema);
