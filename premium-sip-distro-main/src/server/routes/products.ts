
import express from "express";
import Product from "../models/Product";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = express.Router();

// GET /api/products - All active products (customer-facing)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ name: 1 });
    res.json(products);
  } catch (error: any) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/products/admin - All products (admin-only)
router.get("/admin", authenticate, async (req: AuthRequest, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products);
  } catch (error: any) {
    console.error("Get admin products error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/products - Create product (admin-only)
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user?._id,
    };
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error: any) {
    console.error("Create product error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/products/:id - Update product (admin-only)
router.put("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error: any) {
    console.error("Update product error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/products/:id/toggle - Toggle product active status (admin-only)
router.patch("/:id/toggle", authenticate, async (req: AuthRequest, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.isActive = !product.isActive;
    await product.save();
    res.json(product);
  } catch (error: any) {
    console.error("Toggle product error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/products/:id - Delete product (admin-only)
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
