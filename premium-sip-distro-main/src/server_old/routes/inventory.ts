import express from 'express';
import { Inventory, InventoryLog } from '../models/Inventory.ts';
import { Product } from '../models/Product.ts';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// Helper to convert to single units
const getUnits = (quantity: number, unitType: string, product: any) => {
  if (unitType === 'Single') return quantity;
  const purchaseType = product.purchaseTypes?.find((pt: any) => pt.type === unitType);
  if (purchaseType) return quantity * purchaseType.units;
  return quantity;
};

// ADD/RESTOCK INVENTORY (ADMIN)
router.post('/add', authenticate, authorize(['Admin']), async (req: AuthRequest, res) => {
  try {
    const { productId, quantity, unitType, note } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Validate quantity
    if (!quantity) return res.status(400).json({ message: 'Quantity is required' });
    const numQuantity = Number(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }
    console.log("Restock Quantity:", numQuantity);

    const unitsToAdd = getUnits(numQuantity, unitType, product);
    let inventory = await Inventory.findOne({ productId });
    
    if (!inventory) {
      inventory = new Inventory({ productId, quantity: 0 });
    }

    inventory.quantity += unitsToAdd;
    await inventory.save();

    await new InventoryLog({
      type: 'STOCK_ADDED',
      productId: productId,
      adminId: req.user?.id,
      quantityChanged: unitsToAdd,
      balanceAfter: inventory.quantity,
      action: `Added ${numQuantity} ${unitType} of ${product.name} (${unitsToAdd} units)`,
      details: { quantity: numQuantity, unitType, note }
    }).save();

    res.json({ message: 'Stock added successfully', inventory, unitsAdded: unitsToAdd });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// REMOVE INVENTORY (ADMIN)
router.post('/remove', authenticate, authorize(['Admin']), async (req: AuthRequest, res) => {
  try {
    const { productId, quantity, unitType, note } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Validate quantity
    if (!quantity) return res.status(400).json({ message: 'Quantity is required' });
    const numQuantity = Number(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }
    console.log("Remove Stock Quantity:", numQuantity);

    const unitsToRemove = getUnits(numQuantity, unitType, product);
    const inventory = await Inventory.findOne({ productId });
    if (!inventory) return res.status(404).json({ message: 'Inventory not found' });
    
    if (inventory.quantity < unitsToRemove) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    inventory.quantity -= unitsToRemove;
    await inventory.save();

    await new InventoryLog({
      type: 'STOCK_REMOVED',
      productId: productId,
      adminId: req.user?.id,
      quantityChanged: -unitsToRemove,
      balanceAfter: inventory.quantity,
      action: `Removed ${numQuantity} ${unitType} of ${product.name} (${unitsToRemove} units)`,
      details: { quantity: numQuantity, unitType, note }
    }).save();

    res.json({ message: 'Stock removed successfully', inventory, unitsRemoved: unitsToRemove });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET INVENTORY LOGS/TRANSACTIONS (ADMIN)
router.get('/logs', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const { type, productId, startDate, endDate, limit = 100 } = req.query;
    
    const filter: any = {};
    if (type) filter.type = type;
    if (productId) filter.productId = productId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const logs = await InventoryLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('productId', 'name brand size')
      .populate('adminId', 'name email')
      .populate('customerId', 'name email')
      .populate('orderId');

    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET LOW STOCK/OUT OF STOCK ALERTS (ADMIN)
router.get('/alerts', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    const lowStock = [];
    const outOfStock = [];

    for (let product of products) {
      const inventory = await Inventory.findOne({ productId: product._id });
      const stock = inventory ? inventory.quantity : 0;
      if (stock === 0) {
        outOfStock.push({ ...product.toObject(), stock });
      } else if (stock <= product.lowStockThreshold) {
        lowStock.push({ ...product.toObject(), stock });
      }
    }

    res.json({ lowStock, outOfStock });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
