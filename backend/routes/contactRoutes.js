import express from 'express';
import { submitContactForm, getAllInquiries } from '../controllers/contactController.js';
import { contactFormLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Route for submitting the contact form (secured with rate limiting)
router.post('/', contactFormLimiter, submitContactForm);

// Route for retrieving all inquiries (can be authenticated/authorized in production)
router.get('/', getAllInquiries);

export default router;
