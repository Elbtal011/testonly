import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../database';
import { config } from '../config';
import { authenticateJWT } from '../middleware';
import notificationService from '../services/notificationService';
import { getClientIP } from '../utils/ipUtils';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Update last login time
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    
    // Create notification for admin login
    const clientIP = getClientIP(req, config.server.trustProxy);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    await notificationService.notifyAdminLogin(user.username, clientIP, userAgent);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        isAdmin: user.is_admin 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user information
router.get('/me', authenticateJWT, (req, res) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  
  return res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    }
  });
});

// Change password route
router.post('/change-password', authenticateJWT, async (req, res) => {
  const user = (req as any).user;
  const { currentPassword, newPassword } = req.body;
  
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }
  
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters long' });
  }
  
  try {
    const db = getDb();
    const userRecord = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    
    if (!userRecord) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isPasswordValid = await bcrypt.compare(currentPassword, userRecord.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id);
    
    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Server error during password change' });
  }
});

export default router;
