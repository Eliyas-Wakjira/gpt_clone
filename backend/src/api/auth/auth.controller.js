import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../../db/db.config.js'; // src/api/auth -> db/db.config.js

// Signup Controller
export const signup = async (req, res) => {
  const { name, username, email, password } = req.body;
  const displayName = name || username;

  if (!displayName || !email || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [displayName, email, hashedPassword]
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { id: userId, email }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      user: { id: userId, name: displayName, email },
      token
    });
  } catch (err) {
    console.error('Signup Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Login Controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users || users.length === 0) {
      return res.status(400).json({ success: false, error: 'User not found' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};