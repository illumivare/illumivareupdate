import { getGeminiClient } from '../config/gemini.js';

/**
 * @desc    Generate smart insights for an inquiry or a prompt using Gemini
 * @route   POST /api/ai/insight
 * @access  Public (Optionally rate-limited/secure)
 */
export const generateAIInsight = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400);
      throw new Error('Please provide a prompt to generate insights.');
    }

    // 1. Retrieve the secure server-side Gemini client
    const ai = getGeminiClient();

    if (!ai) {
      res.status(503).json({
        success: false,
        message: 'AI Service is currently unavailable. GEMINI_API_KEY is not configured in the environment variables.'
      });
      return;
    }

    // 2. Call Gemini model 'gemini-3.5-flash' as recommended for basic/intermediate text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an intelligent, professional business growth consultant analyzing new inquiries to help craft tailored suggestions.'
      }
    });

    // 3. Extract the generated text safely using standard .text property
    const aiText = response.text;

    res.status(200).json({
      success: true,
      text: aiText
    });
  } catch (error) {
    next(error);
  }
};
