
import express from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import InventoryLog from "../models/InventoryLog";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = express.Router();

// POST create order (customer-facing)
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { items, deliveryAddress, phoneNumber, customerName, notes } = req.body;

    // Process order items with proper pricing
    const processedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check stock
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      // Find purchase type to get price
      let unitPrice = item.unitPrice || product.price;
      if (item.purchaseType && product.purchaseTypes) {
        const pt = product.purchaseTypes.find(pt => pt.type === item.purchaseType);
        if (pt) unitPrice = pt.sellingPrice;
      }

      const totalPrice = unitPrice * item.quantity;
      totalAmount += totalPrice;

      processedItems.push({
        productId: item.productId,
        purchaseType: item.purchaseType,
        size: item.size,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    // Generate unique order number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${year}${month}${day}-${random}`;

    // Create order
    const order = new Order({
      orderNumber,
      customerId: req.user?._id,
      customerName,
      phoneNumber,
      deliveryAddress,
      notes,
      items: processedItems,
      totalAmount,
      status: "Pending",
      date: new Date(),
    });

    await order.save();

    // Decrement stock and log inventory
    for (const item of processedItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantity -= item.quantity;
        await product.save();

        // Log inventory change
        const log = new InventoryLog({
          productId: item.productId,
          type: "STOCK_REMOVED",
          quantityChanged: item.quantity,
          unitType: item.purchaseType || "Units",
          action: `Stock removed for order ${order.orderNumber}`,
          user: customerName,
        });
        await log.save();
      }
    }

    res.status(201).json(order);
  } catch (error: any) {
    console.error("Create order error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// GET my orders (customer)
router.get("/my", authenticate, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find({ customerId: req.user?._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error: any) {
    console.error("Get my orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all orders (admin)
router.get("/admin", authenticate, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("items.productId", "name image");
    res.json(orders);
  } catch (error: any) {
    console.error("Get admin orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH update order status
router.patch("/:id/status", authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("items.productId", "name image");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error: any) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
