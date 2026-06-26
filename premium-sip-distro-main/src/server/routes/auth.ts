
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import CustomerProfile from "../models/CustomerProfile";
import { BusinessInfo } from "../models/BusinessInfo";
import { authenticate, AuthRequest } from "../middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for allowed types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Unsupported file type! Allowed: jpg, jpeg, png, webp"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate JWT
    const secret = process.env.JWT_SECRET || "your_super_secret_jwt_key";
    const token = jwt.sign({ id: user._id, role: user.role }, secret);

    // Return user data
    const userObj = user.toObject();
    const { _id, password: _, ...rest } = userObj;
    res.status(201).json({
      token,
      user: {
        id: _id,
        ...rest,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET || "your_super_secret_jwt_key";
    const token = jwt.sign({ id: user._id, role: user.role }, secret);

    // Return user data
    const userObj = user.toObject();
    const { _id, password: _, ...rest } = userObj;
    res.json({
      token,
      user: {
        id: _id,
        ...rest,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Profile
router.get("/profile", authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Convert _id to id for frontend
    const userObj = req.user.toObject();
    const { _id, password: _, ...rest } = userObj;
    res.json({ id: _id, ...rest });
  } catch (error: any) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Profile
router.put("/profile", authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { name, email, phoneNumber, deliveryAddress } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phoneNumber, deliveryAddress },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Convert _id to id for frontend
    const userObj = user.toObject();
    const { _id, ...rest } = userObj;
    res.json({ id: _id, ...rest });
  } catch (error: any) {
    console.error("Update profile error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Change Password
router.put("/profile/password", authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Upload Profile Image
router.post("/profile/image", authenticate, upload.single("image"), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // If user already has an image, delete the old one
    if (req.user.profileImage) {
      const oldImagePath = path.resolve(process.cwd(), req.user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new image path
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: `/uploads/${req.file.filename}` },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userObj = user.toObject();
    const { _id, ...rest } = userObj;
    res.json({ id: _id, ...rest });
  } catch (error: any) {
    console.error("Upload image error:", error);
    if (error.message) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Profile Image
router.delete("/profile/image", authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Delete the image file if it exists
    if (req.user.profileImage) {
      const imagePath = path.resolve(process.cwd(), req.user.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Update user to remove image
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: null },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userObj = user.toObject();
    const { _id, ...rest } = userObj;
    res.json({ id: _id, ...rest });
  } catch (error: any) {
    console.error("Delete image error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Business Info
router.get("/business", authenticate, async (req: AuthRequest, res) => {
  try {
    let businessInfo = await BusinessInfo.findOne();
    if (!businessInfo) {
      businessInfo = new BusinessInfo();
      await businessInfo.save();
    }
    res.json(businessInfo);
  } catch (error: any) {
    console.error("Get business info error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Business Info
router.put("/business", authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, phone, address } = req.body;
    let businessInfo = await BusinessInfo.findOne();
    if (!businessInfo) {
      businessInfo = new BusinessInfo();
    }
    businessInfo.name = name || businessInfo.name;
    businessInfo.phone = phone || businessInfo.phone;
    businessInfo.address = address || businessInfo.address;
    businessInfo.updatedAt = new Date();
    await businessInfo.save();
    res.json(businessInfo);
  } catch (error: any) {
    console.error("Update business info error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
