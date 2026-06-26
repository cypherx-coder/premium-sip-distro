import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true, 
    unique: true 
  },
  quantity: { type: Number, default: 0 }, // Total single units in stock
  lastUpdated: { type: Date, default: Date.now }
});

inventorySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

export const Inventory = mongoose.model('Inventory', inventorySchema);

// TRANSACTION HISTORY (Inventory + Orders + Payments)
const inventoryLogSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['PRODUCT_ADDED', 'STOCK_ADDED', 'STOCK_REMOVED', 'ORDER_PLACED', 'ORDER_UPDATED', 'PAYMENT_RECEIVED'] 
  },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  quantityChanged: { type: Number, default: 0 }, // in single units
  balanceAfter: { type: Number }, // inventory after change
  amount: { type: Number }, // for payments
  
  action: { type: String, required: true }, // human-readable description
  details: { type: mongoose.Schema.Types.Mixed }, // flexible extra data
  createdAt: { type: Date, default: Date.now }
});

export const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);
