const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');
const { buildEsgContext } = require('../utils/dataContext');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are EcoSphere Assistant, an expert ESG (Environmental, Social, and Governance) analyst embedded inside the EcoSphere platform. You have access to real-time ESG data for the organization.

Your job is to answer questions about the organization's ESG performance clearly, concisely, and helpfully. You:
- Cite specific numbers from the data provided
- Identify trends (improving, declining, stable)
- Highlight risks (overdue compliance issues, goals at risk, low participation)
- Suggest practical, actionable improvements
- Keep answers under 150 words unless the user asks for detail
- Use a professional but friendly tone
- Format responses with short paragraphs or bullet points when listing multiple items
- Never make up data — only reference what's in the context provided
- If asked about something not in the data, say so clearly

You are NOT a general AI assistant. Stay focused on ESG topics related to this organization's data.`;

// In-memory conversation history per user
const conversationHistory = {};

router.post('/chat', auth, async (req, res) => {
  try {
    const { message, resetHistory } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (resetHistory || !conversationHistory[userId]) {
      conversationHistory[userId] = [];
    }

    // Fetch live ESG data
    const esgContext = await buildEsgContext();

    const contextualMessage = `[CURRENT ESG DATA SNAPSHOT - ${new Date().toLocaleDateString()}]
${JSON.stringify(esgContext, null, 2)}
[END OF DATA]

User question: ${message}`;

    // Add to history
    conversationHistory[userId].push({
      role: 'user',
      content: contextualMessage
    });

    // Keep last 10 exchanges
    if (conversationHistory[userId].length > 20) {
      conversationHistory[userId] = conversationHistory[userId].slice(-20);
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory[userId]
      ],
      max_tokens: 1024,
      temperature: 0.7
    });

    const assistantMessage = response.choices[0].message.content;

    // Save clean user message (without context blob)
    conversationHistory[userId][conversationHistory[userId].length - 1] = {
      role: 'user',
      content: message
    };

    // Save assistant response
    conversationHistory[userId].push({
      role: 'assistant',
      content: assistantMessage
    });

    res.json({
      answer: assistantMessage,
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0
      }
    });

  } catch (err) {
    console.error('Assistant error:', err);
    if (err.status === 401) {
      return res.status(500).json({ error: 'AI service not configured. Add GROQ_API_KEY to .env' });
    }
    res.status(500).json({ error: 'Assistant unavailable', detail: err.message });
  }
});

router.delete('/chat/history', auth, (req, res) => {
  delete conversationHistory[req.user.id];
  res.json({ message: 'Conversation history cleared' });
});

module.exports = router;