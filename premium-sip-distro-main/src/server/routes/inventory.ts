
import express from "express";
import InventoryLog from "../models/InventoryLog";
import Product from "../models/Product";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = express.Router();

// GET inventory alerts
router.get("/alerts", authenticate, async (req: AuthRequest, res) => {
  try {
    const products = await Product.find({ isActive: true });
    const lowStock = products.filter(p => p.quantity <= p.lowStockThreshold && p.quantity > 0);
    const outOfStock = products.filter(p => p.quantity === 0);
    res.json({ lowStock, outOfStock });
  } catch (error: any) {
    console.error("Get inventory alerts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET inventory logs
router.get("/logs", authenticate, async (req: AuthRequest, res) => {
  try {
    const logs = await InventoryLog.find()
      .sort({ createdAt: -1 })
      .populate("productId", "name");
    res.json(logs);
  } catch (error: any) {
    console.error("Get inventory logs error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST add stock
router.post("/add", authenticate, async (req: AuthRequest, res) => {
  try {
    const { productId, quantity, unitType, action, user } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.quantity += quantity;
    await product.save();
    
    const log = new InventoryLog({
      productId,
      type: "STOCK_ADDED",
      quantityChanged: quantity,
      unitType: unitType || "Units",
      action: action || "Stock Added",
      user: user || req.user?.name || "Admin",
    });
    await log.save();
    
    const products = await Product.find().sort({ name: 1 });
    res.json({ products, message: "Stock added successfully" });
  } catch (error: any) {
    console.error("Add stock error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST remove stock
router.post("/remove", authenticate, async (req: AuthRequest, res) => {
  try {
    const { productId, quantity, unitType, action, user } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }
    product.quantity -= quantity;
    await product.save();
    
    const log = new InventoryLog({
      productId,
      type: "STOCK_REMOVED",
      quantityChanged: quantity,
      unitType: unitType || "Units",
      action: action || "Stock Removed",
      user: user || req.user?.name || "Admin",
    });
    await log.save();
    
    const products = await Product.find().sort({ name: 1 });
    res.json({ products, message: "Stock removed successfully" });
  } catch (error: any) {
    console.error("Remove stock error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
