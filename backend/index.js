import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db/db.config.js';
import mainRouter from './src/api/main.route.js';

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Main router handles both /api/chat and /api/auth
app.use('/api', mainRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    return res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

async function startServer() {
    try {
        const connection = await db.getConnection();
        console.log('Db connected');
        connection.release();

        app.listen(3888, () => {
            console.log('Server is running on port http://localhost:3888');
        });
    } catch (error) {
        console.error('Error starting server:', error.message);
    }
}

startServer();