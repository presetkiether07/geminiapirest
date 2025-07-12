const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Add this in your .env or Secrets tab in Replit

// 🔥 Endpoint: Text or Image prompt
app.post('/api/gemini', async (req, res) => {
  const { prompt, image_base64 } = req.body;

  if (!prompt && !image_base64) {
    return res.status(400).json({ error: 'Missing prompt or image_base64' });
  }

  try {
    const contents = [
      { parts: [{ text: prompt }] }
    ];

    if (image_base64) {
      contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: image_base64
        }
      });
    }

    const geminiRes = await axios.post(
      https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY},
      { contents },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const reply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No reply';

    return res.json({ success: true, reply });

  } catch (err) {
    console.error('❌ Gemini error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Gemini request failed', detail: err.message });
  }
});

  app.listen(PORT, () => {console.log(`🚀 Gemini API listening at http://localhost:${PORT}`); });