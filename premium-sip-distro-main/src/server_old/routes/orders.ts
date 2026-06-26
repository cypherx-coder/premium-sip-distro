import express from 'express';
import { Order, Customer } from '../models/Order.ts';
import { Product } from '../models/Product.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// GET ALL ORDERS
router.get('/admin', authenticate, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('customer').populate('items.product');
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL CUSTOMERS
router.get('/customers', authenticate, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET SINGLE ORDER
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer').populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE ORDER STATUS
router.patch('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
