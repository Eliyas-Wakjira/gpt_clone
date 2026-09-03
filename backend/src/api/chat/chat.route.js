import express from 'express';
import { GoogleGenAI } from '@google/genai';
import db from '../../../db/db.config.js';

const chatRouter = express.Router();
const ai = new GoogleGenAI();

// GET /api/chat/conversations
chatRouter.get('/conversations', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM conversations ORDER BY id ASC');
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

  if (!question) {
    return res.status(400).json({ success: false, error: 'Question is required' });
  }

  try {
    // 1. User question database irratti save gochuu
    await db.query(
      'INSERT INTO conversations (role, content) VALUES (?, ?)',
      ['user', question]
    );

    // 2. Gemini API model version haaraa waamuu
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash', // Model name 'gemini-3.6-flash' jedhuun bakka bu'eera
      contents: question,
    });

    const aiReply = response.text || 'Deebii uumuu hin dandeenye.';

    // 3. AI response database irratti save gochuu
    await db.query(
      'INSERT INTO conversations (role, content) VALUES (?, ?)',
      ['assistant', aiReply]
    );

    // 4. Conversation DB irraa fetch gochuun deebisuu
    const [updatedRows] = await db.query('SELECT * FROM conversations ORDER BY id ASC');

    return res.json({
      success: true,
      messages: updatedRows
    });
  } catch (err) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default chatRouter;