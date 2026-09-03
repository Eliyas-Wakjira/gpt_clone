import { GoogleGenAI } from '@google/genai';
import db from '../../../../db/db.config.js';


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getRecentConversationRows = async (limit = 10) => {
    const safeLimit = Number(limit) || 10;
    const [rows] = await db.execute(
        `SELECT id, role, content, token_count, created_at FROM conversations ORDER BY id DESC LIMIT ${safeLimit}`
    );
    return rows.reverse();
};

export async function createConversationService(question) {
    if (!question || typeof question !== 'string' || !question.trim()) {
        const error = new Error('Question is required');
        error.status = 400;
        throw error;
    }

    const trimmedQuestion = question.trim();

    // 1. Durani history DB irraa fiduu
    const existingHistory = await getRecentConversationRows(10);

    // 2. Gemini-if format gochuu
    const formattedContents = existingHistory.map((row) => ({
        role: row.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: row.content }]
    }));

    formattedContents.push({
        role: 'user',
        parts: [{ text: trimmedQuestion }]
    });

    // 3. User prompt token lakkaawwuu fi DB save godhuu
    let userTokenCount = 0;
    try {
        const tokenRes = await ai.models.countTokens({
            model: 'gemini-3.6-flash',
            contents: trimmedQuestion
        });
        userTokenCount = tokenRes.totalTokens || 0;
    } catch (e) {
        console.log('User token error:', e.message);
    }

    await db.execute(
        'INSERT INTO conversations (content, role, token_count) VALUES (?, "user", ?)',
        [trimmedQuestion, userTokenCount]
    );

    // 4. Gemini API waamuu
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: formattedContents,
    });

    const aiResponse = response.text;
    const assistantTokenCount = response.usageMetadata?.candidatesTokenCount || response.usageMetadata?.totalTokenCount || 0;

    // 5. Assistant response DB-tti save godhuu
    await db.execute(
        'INSERT INTO conversations (content, role, token_count) VALUES (?, "assistant", ?)',
        [aiResponse, assistantTokenCount]
    );

    // 6. Conversations 5 dhiyeenya galan array ta'anii deebi'an
    const updatedHistory = await getRecentConversationRows(5);

    return updatedHistory;
}
export async function getConversationsService() {
    // Row 100 dhiyeenya galan descending order (DESC) bifa ta'een fiduu
    const [rows] = await db.execute(
        'SELECT id, role, content, token_count, created_at FROM conversations ORDER BY id DESC LIMIT 100'
    );
    return rows;
}