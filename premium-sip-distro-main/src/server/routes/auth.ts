import express from 'express';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await (user as any).comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Profile
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update Profile
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { name, email },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Change Password
router.put('/profile/password', authenticate, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = await (user as any).comparePassword(currentPassword);
    if (!isValid) return res.status(401).json({ message: 'Invalid current password' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
