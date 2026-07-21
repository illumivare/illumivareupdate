import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Import custom modules
import { connectDB } from './config/db.js';
import contactRoutes from './routes/contactRoutes.js';
import geminiRoutes from './routes/geminiRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

// Resolve directory paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Establish database connection with MongoDB Atlas via Mongoose
connectDB();

// 2. Apply Security and Utility Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Let the frontend application handle CSP constraints if needed
}));
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON payloads

// 3. API Route Mounting
app.use('/api/contact', contactRoutes);
app.use('/api/gemini', geminiRoutes);

// 4. Default API Welcoming Endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Secure Backend API. Everything is running smoothly!',
    endpoints: {
      contact: 'POST /api/contact - Submit new inquiries',
      geminiInsight: 'POST /api/gemini/insight - Generate smart analysis'
    }
  });
});

// Serve frontend static assets in production if compiled dist folder is present
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback: serve the index.html from dist/ for SPA single-page routing
app.get(/.*/, (req, res, next) => {
  // If the request starts with /api, let it bypass static serving so it hits 404 handler
  if (req.url.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // If index.html doesn't exist yet, return a API message rather than throwing
      res.status(200).send('Secure Backend is running! Build your frontend to see the static site preview.');
    }
  });
});

// 5. Apply Error & 404 Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// 6. Start listening
app.listen(PORT, () => {
  console.log(`Server is running securely in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
