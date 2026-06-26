import express from 'express';
import { Order } from '../models/Order.ts';
import { User } from '../models/User.ts';
import { Product } from '../models/Product.ts';
import { Sale } from '../models/Sale.ts';
import { Transaction } from '../models/Transaction.ts';
import { authenticate, authorize } from '../middleware/auth.ts';

const router = express.Router();

// GET TRANSACTIONS (ADMIN)
router.get('/transactions', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const { orderId, orderNumber, action, startDate, endDate, limit = 50 } = req.query;
    const filter: any = {};

    if (orderId) filter.orderId = orderId;
    if (orderNumber) filter.orderNumber = orderNumber;
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DASHBOARD SUMMARY (ADMIN)
router.get('/summary', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total Revenue from Paid/Delivered orders
    const totalRevenueData = await Order.aggregate([
      { $match: { status: { $in: ['Paid', 'Delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    // Total Profit from Sale records
    const totalProfitData = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$totalProfit' } } }
    ]);

    // Today's Revenue
    const todayRevenueData = await Order.aggregate([
      { $match: { updatedAt: { $gte: todayStart }, status: { $in: ['Paid', 'Delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Monthly Revenue
    const monthlyRevenueData = await Order.aggregate([
      { $match: { updatedAt: { $gte: monthStart }, status: { $in: ['Paid', 'Delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'Customer' });
    const totalProducts = await Product.countDocuments();

    const pending = await Order.countDocuments({ status: 'Pending' });
    const paid = await Order.countDocuments({ status: 'Paid' });
    const delivered = await Order.countDocuments({ status: 'Delivered' });

    res.json({
      totalRevenue: totalRevenueData[0]?.total || 0,
      totalProfit: totalProfitData[0]?.total || 0,
      todayRevenue: todayRevenueData[0]?.total || 0,
      monthlyRevenue: monthlyRevenueData[0]?.total || 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      pending,
      paid,
      delivered
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// SALES REPORTS (ADMIN)
router.get('/sales', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;
    let dateFilter: any = {};
    
    const now = new Date();
    
    if (startDate && endDate) {
      dateFilter.createdAt = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    } else {
      switch (period) {
        case 'daily':
          dateFilter.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
          break;
        case 'weekly':
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          dateFilter.createdAt = { $gte: weekAgo };
          break;
        case 'monthly':
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          dateFilter.createdAt = { $gte: monthAgo };
          break;
        case 'yearly':
          const yearAgo = new Date();
          yearAgo.setFullYear(now.getFullYear() - 1);
          dateFilter.createdAt = { $gte: yearAgo };
          break;
      }
    }
    dateFilter.status = { $ne: 'Cancelled' };

    const orders = await Order.find(dateFilter).populate('items.productId');

    const productSales: any = {};
    let totalRevenue = 0;
    let totalItemsSold = 0;

    orders.forEach(order => {
      totalRevenue += order.totalAmount;
      order.items.forEach(item => {
        const product = item.productId as any;
        const prodId = product._id.toString();
        if (!productSales[prodId]) {
          productSales[prodId] = {
            product: product,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[prodId].quantity += item.units;
        productSales[prodId].revenue += item.totalPrice;
        totalItemsSold += item.units;
      });
    });

    const sortedProductSales = Object.values(productSales).sort((a: any, b: any) => b.revenue - a.revenue);

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      totalItemsSold,
      productSales: sortedProductSales
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PRODUCT PERFORMANCE (BEST SELLERS, SLOW MOVING, MOST PROFITABLE) (ADMIN)
router.get('/performance', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'Cancelled' } }).populate('items.productId');
    const productStats: any = {};
    const products = await Product.find();

    products.forEach(p => {
      productStats[p._id.toString()] = {
        product: p,
        unitsSold: 0,
        revenue: 0,
        profit: 0,
        lastSold: null
      };
    });

    orders.forEach(order => {
      order.items.forEach(item => {
        const product = item.productId as any;
        const prodId = product._id.toString();
        const units = item.units;
        const profit = item.totalPrice - (product.costPrice * units);
        
        productStats[prodId].unitsSold += units;
        productStats[prodId].revenue += item.totalPrice;
        productStats[prodId].profit += profit;
        
        if (!productStats[prodId].lastSold || order.createdAt > productStats[prodId].lastSold) {
          productStats[prodId].lastSold = order.createdAt;
        }
      });
    });

    const statsArray = Object.values(productStats);
    const bestSellers = [...statsArray].sort((a: any, b: any) => b.unitsSold - a.unitsSold).slice(0, 10);
    const mostProfitable = [...statsArray].sort((a: any, b: any) => b.profit - a.profit).slice(0, 10);
    const slowMoving = [...statsArray].filter((s: any) => s.unitsSold === 0).concat([...statsArray].filter((s: any) => s.unitsSold > 0).sort((a: any, b: any) => a.unitsSold - b.unitsSold));

    res.json({
      bestSellers,
      mostProfitable,
      slowMoving
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL CUSTOMERS (ADMIN)
router.get('/customers', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const { search } = req.query;
    const filter: any = { role: 'Customer' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await User.find(filter).sort({ createdAt: -1 });
    const customerData = [];

    for (let customer of customers) {
      const orders = await Order.find({ customerId: customer._id, status: { $ne: 'Cancelled' } });
      const totalSpent = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
      customerData.push({
        ...customer.toObject(),
        totalOrders: orders.length,
        totalSpent
      });
    }

    res.json(customerData);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET CUSTOMER DETAILS (ADMIN)
router.get('/customers/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const orders = await Order.find({ customerId: req.params.id }).populate('items.productId').sort({ createdAt: -1 });
    const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      customer,
      orders,
      totalOrders: orders.length,
      totalSpent
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
