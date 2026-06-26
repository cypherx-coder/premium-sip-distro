
import express from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import User from "../models/User";
import InventoryLog from "../models/InventoryLog";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = express.Router();

// GET reports summary
router.get("/summary", authenticate, async (req: AuthRequest, res) => {
  try {
    const products = await Product.find();
    const orders = await Order.find();
    const customers = await User.find({ role: "Customer" });
    
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = orders
      .filter((o) => new Date(o.date) >= today)
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenue = orders
      .filter((o) => new Date(o.date) >= firstDayOfMonth)
      .reduce((sum, o) => sum + o.totalAmount, 0);
    
    const pendingCount = orders.filter((o) => o.status === "Pending").length;
    const paidCount = orders.filter((o) => o.status === "Paid").length;
    const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
    
    res.json({
      totalRevenue,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      totalProducts: products.length,
      pending: pendingCount,
      paid: paidCount,
      delivered: deliveredCount,
      totalProfit: totalRevenue * 0.3, // rough estimate
      todayRevenue,
      monthlyRevenue,
    });
  } catch (error: any) {
    console.error("Get summary error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET reports performance
router.get("/performance", authenticate, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find().populate("items.productId");
    const products = await Product.find();
    
    const productSales: any = {};
    const productLastSold: any = {};
    
    for (const order of orders) {
      for (const item of order.items) {
        if (item.productId) {
          const productId = item.productId.toString();
          if (!productSales[productId]) {
            productSales[productId] = {
              product: item.productId,
              unitsSold: 0,
              revenue: 0,
              profit: 0,
            };
          }
          productSales[productId].unitsSold += item.quantity;
          productSales[productId].revenue += item.totalPrice;
          productSales[productId].profit += item.totalPrice * 0.3;
          if (!productLastSold[productId] || new Date(order.date) > new Date(productLastSold[productId])) {
            productLastSold[productId] = order.date;
          }
        }
      }
    }
    
    const bestSellers = Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);
    
    const mostProfitable = Object.values(productSales)
      .sort((a: any, b: any) => b.profit - a.profit)
      .slice(0, 10);
    
    // Slow moving: products with no sales or very low units sold
    const slowMoving = products.map(p => {
      const saleData = productSales[p._id.toString()] || { product: p, unitsSold: 0, revenue: 0 };
      return {
        ...saleData,
        product: p,
        lastSold: productLastSold[p._id.toString()] || null,
      };
    }).sort((a: any, b: any) => a.unitsSold - b.unitsSold).slice(0, 10);
    
    res.json({ bestSellers, mostProfitable, slowMoving });
  } catch (error: any) {
    console.error("Get performance error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET sales reports
router.get("/sales", authenticate, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    let query: any = {};
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    
    const orders = await Order.find(query).sort({ date: -1 }).populate("items.productId");
    
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;
    const totalItemsSold = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
    
    res.json({
      sales: orders,
      totalRevenue,
      totalOrders,
      totalItemsSold,
    });
  } catch (error: any) {
    console.error("Get sales error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET transactions
router.get("/transactions", authenticate, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 }).populate("items.productId");
    const inventoryLogs = await InventoryLog.find().sort({ createdAt: -1 }).populate("productId");
    
    const transactions: any[] = [];
    
    // Add order transactions
    orders.forEach(order => {
      const date = new Date(order.date);
      transactions.push({
        _id: order._id,
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
        action: "Order Created",
        orderNumber: order.orderNumber,
        user: order.customerName,
        description: `Order ${order.orderNumber} created for ₦${order.totalAmount.toLocaleString()}`,
        createdAt: order.createdAt,
      });
      if (order.status === "Paid") {
        transactions.push({
          _id: `${order._id}-paid`,
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString(),
          action: "Payment Confirmed",
          orderNumber: order.orderNumber,
          user: "Admin",
          description: `Payment confirmed for order ${order.orderNumber}`,
          createdAt: order.updatedAt,
        });
      }
      if (order.status === "Delivered") {
        transactions.push({
          _id: `${order._id}-delivered`,
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString(),
          action: "Delivery Confirmed",
          orderNumber: order.orderNumber,
          user: "Admin",
          description: `Order ${order.orderNumber} delivered`,
          createdAt: order.updatedAt,
        });
      }
      if (order.status === "Cancelled") {
        transactions.push({
          _id: `${order._id}-cancelled`,
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString(),
          action: "Order Cancelled",
          orderNumber: order.orderNumber,
          user: "Admin",
          description: `Order ${order.orderNumber} cancelled`,
          createdAt: order.updatedAt,
        });
      }
    });
    
    // Add inventory transactions
    inventoryLogs.forEach(log => {
      const date = new Date(log.createdAt);
      transactions.push({
        _id: log._id,
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
        action: log.type === "STOCK_ADDED" ? "Stock Added" : "Stock Removed",
        orderNumber: null,
        user: log.user,
        description: `${log.type === "STOCK_ADDED" ? "Added" : "Removed"} ${log.quantityChanged} units of ${(log.productId as any)?.name || "Product"}`,
        createdAt: log.createdAt,
      });
    });
    
    // Sort all transactions by date
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json(transactions);
  } catch (error: any) {
    console.error("Get transactions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET reports customers list
router.get("/customers", authenticate, async (req: AuthRequest, res) => {
  try {
    const customers = await User.find({ role: "Customer" }).sort({
      createdAt: -1,
    });
    const orders = await Order.find();
    
    const customerStats = customers.map((customer) => {
      const customerOrders = orders.filter(
        (o) => o.customerId?.toString() === customer._id.toString()
      );
      return {
        ...customer.toObject(),
        totalOrders: customerOrders.length,
        totalSpent: customerOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      };
    });
    
    res.json(customerStats);
  } catch (error: any) {
    console.error("Get customers error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single customer reports
router.get("/customers/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    const orders = await Order.find({
      customerId: customer._id,
    }).sort({ createdAt: -1 });
    
    res.json({
      customer,
      orders,
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    });
  } catch (error: any) {
    console.error("Get customer detail error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
