import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: String, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String },
    quantity: { type: Number },
    revenue: { type: Number },
    profit: { type: Number }
  }],
  totalRevenue: { type: Number, required: true },
  totalProfit: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export const Sale = mongoose.model('Sale', saleSchema);
