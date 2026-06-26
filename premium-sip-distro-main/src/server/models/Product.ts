import mongoose from 'mongoose';

const purchaseTypeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  units: { type: Number, required: true },
  sellingPrice: { type: Number, required: true, min: 0 }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  category: { type: String },
  quantity: { type: Number, default: 0 },
  sku: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  brand: { type: String, default: '' },
  packageType: { type: String, default: '' },
  purchaseTypes: [purchaseTypeSchema],
  costPrice: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true }
});

productSchema.virtual('stock').get(function() {
  return this.quantity;
});

productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });

productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Product = mongoose.model('Product', productSchema);
