import mongoose from 'mongoose';

const salesReportSchema = new mongoose.Schema({
  period: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'], required: true },
  date: { type: Date, required: true },
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  productSales: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const SalesReport = mongoose.model('SalesReport', salesReportSchema);
