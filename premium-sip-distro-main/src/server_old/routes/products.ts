import express from 'express';
import { Product } from '../models/Product.ts';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// GET ALL PRODUCTS (ADMIN)
router.get('/admin', authenticate, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    const productList = products.map(p => p.toObject());
    res.json(productList);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL PRODUCTS (CUSTOMER)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ADD PRODUCT (ADMIN)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const productData = req.body;
    const product = new Product({
      ...productData,
      createdBy: req.user?.id
    });
    await product.save();
    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PRODUCT (ADMIN)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// TOGGLE ACTIVE STATUS (ADMIN)
router.patch('/:id/toggle', authenticate, async (req: AuthRequest, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.isActive = !product.isActive;
    await product.save();
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE PRODUCT (ADMIN)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
