import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

/**
 * Initializes and retrieves the Google Gen AI client instance lazily.
 * This prevents server startup crashes if GEMINI_API_KEY is not yet defined.
 * 
 * @returns {GoogleGenAI|null} The initialized GoogleGenAI instance or null if key is missing.
 */
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY is not configured in environment variables. AI features will be unavailable.');
    return null;
  }

  if (!aiInstance) {
    try {
      // Create a single, shared Google Gen AI client following AI Studio Build guidelines
      aiInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build' // Set for telemetry tracking as per guidelines
          }
        }
      });
      console.log('Google Gen AI Gemini client initialized successfully.');
    } catch (err) {
      console.error('Failed to initialize Google Gen AI client:', err.message);
      aiInstance = null;
    }
  }

  return aiInstance;
}
