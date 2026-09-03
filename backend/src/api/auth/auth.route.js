import express from 'express';
import { signup, login } from './auth.controller.js';

const authRouter = express.Router();

// Routes definition
authRouter.post('/signup', signup);
authRouter.post('/login', login);

export default authRouter;