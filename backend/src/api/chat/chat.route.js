import express from 'express';
import { GoogleGenAI } from '@google/genai';
import db from '../../../db/db.config.js';
import { authenticateToken } from '../../middileware/auth.middleware.js';

const chatRouter = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

chatRouter.use(authenticateToken);

// GET /api/chat/conversations
chatRouter.get('/conversations', async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY id ASC',
      [userId]
    );

    return res.json({
      success: true,
      messages: rows || []
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/chat/conversations
chatRouter.post('/conversations', async (req, res) => {
  const { question } = req.body;
  const userId = req.user.id;

  if (!question) {
    return res.status(400).json({ success: false, error: 'Question is required' });
  }

  try {
    await db.query(
      'INSERT INTO conversations (user_id, role, content) VALUES (?, ?, ?)',
      [userId, 'user', question]
    );

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: question,
    });

    const aiReply = response.text || 'Deebii uumuu hin dandeenye.';

    await db.query(
      'INSERT INTO conversations (user_id, role, content) VALUES (?, ?, ?)',
      [userId, 'assistant', aiReply]
    );

    const [updatedRows] = await db.query(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY id ASC',
      [userId]
    );

    return res.json({
      success: true,
      messages: updatedRows
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default chatRouter;