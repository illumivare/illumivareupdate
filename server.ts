import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// ==========================================
// 1. DATABASE CONFIGURATION (Mongoose & Atlas)
// ==========================================
// Use process.env.MONGODB_URI as requested by the user
const mongoUrl = process.env.MONGODB_URI;

async function connectDatabase() {
  if (!mongoUrl) {
    console.error('Error: MONGODB_URI is not set. Please configure MONGODB_URI in Settings.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUrl);
    console.log(`Successfully connected to MongoDB Atlas via Mongoose: ${conn.connection.host}`);
  } catch (err: any) {
    console.error(`Failed to connect to MongoDB Atlas: ${err.message}`);
  }
}

connectDatabase();

// Define a robust, secure Mongoose model for Lead submissions
const LeadSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 100 },
  businessName: { type: String, required: true, trim: true, maxlength: 100 },
  email: { 
    type: String, 
    required: true, 
    trim: true, 
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  service: { type: String, trim: true, maxlength: 100 },
  budget: { type: String, trim: true, maxlength: 100 },
  timeline: { type: String, trim: true, maxlength: 100 },
  details: { type: String, trim: true, maxlength: 2000 },
  contactMethod: { type: String, enum: ['Email', 'Phone', 'SMS', 'Other'], default: 'Email' },
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

// ==========================================
// 2. GEMINI CLIENT CONFIGURATION
// ==========================================
let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY is not defined. AI features will be unavailable.');
    return null;
  }

  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (err: any) {
      console.error('Failed to initialize Gemini Client:', err.message);
    }
  }
  return aiClient;
}

// ==========================================
// 3. SECURITY & RATE LIMITING MIDDLEWARE
// ==========================================
app.use(helmet({
  contentSecurityPolicy: false, // Allows frontend preview rendering within the iframe
}));
app.use(cors());
app.use(express.json());

// Standard rate limiter: Limit total API requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests from this IP. Please try again later.' }
});

// Strict rate limiter: Protect the lead submission contact form from spam bots
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many contact attempts. Please wait 15 minutes before submitting another inquiry.' }
});

// Serve frontend static assets
app.use(express.static(path.join(__dirname, 'dist')));

// ==========================================
// 4. ROUTE HANDLERS
// ==========================================

// Secure Contact/Lead Form Submission Endpoint
app.post('/api/contact', contactLimiter, async (req, res): Promise<void> => {
  try {
    const { fullName, businessName, email, service, budget, timeline, details, contactMethod } = req.body;

    // Server-side strict validations
    if (!fullName || !businessName || !email) {
      res.status(400).json({
        success: false,
        message: 'Full Name, Business Name, and Email are required fields.'
      });
      return;
    }

    const newLead = await Lead.create({
      fullName,
      businessName,
      email,
      service,
      budget,
      timeline,
      details,
      contactMethod
    });

    res.status(200).json({
      success: true,
      message: 'Inquiry successfully saved to MongoDB Atlas via Mongoose.',
      leadId: newLead._id
    });
  } catch (error: any) {
    console.error('Lead submission failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while saving the inquiry.'
    });
  }
});

// Secure Server-side Gemini AI Insight generation endpoint
app.post('/api/gemini/insight', generalLimiter, async (req, res): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ success: false, message: 'Please provide a prompt.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        success: false,
        message: 'AI Service is unavailable. GEMINI_API_KEY is not configured in Settings.'
      });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash', // Recommended for standard text analysis
      contents: prompt,
      config: {
        systemInstruction: 'You are an intelligent business partner analyzing new inquiries to suggest excellent next steps.'
      }
    });

    res.status(200).json({
      success: true,
      text: response.text
    });
  } catch (error: any) {
    console.error('Gemini AI execution failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during AI analysis.'
    });
  }
});

// Fallback: serve the index.html from dist/ for SPA single-page routing
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Secure Server is running on port ${PORT}`);
});
