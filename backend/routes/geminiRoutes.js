import express from 'express';
import { generateAIInsight } from '../controllers/geminiController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Route to generate smart AI insights via Gemini (secured with API rate limit)
router.post('/insight', apiLimiter, generateAIInsight);

export default router;
