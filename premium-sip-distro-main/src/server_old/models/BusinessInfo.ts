import mongoose from 'mongoose';

const businessInfoSchema = new mongoose.Schema({
  name: { type: String, default: 'EMEEBS Ventures' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

export const BusinessInfo = mongoose.model('BusinessInfo', businessInfoSchema);
