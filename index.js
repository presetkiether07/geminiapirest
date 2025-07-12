const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/gemini', async (req, res) => {
  const { prompt, image_base64 } = req.body;

  if (!prompt && !image_base64) {
    return res.status(400).json({ error: 'Missing prompt or image_base64' });
  }

  try {
    const parts = [{ text: prompt }];

    if (image_base64) {
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: image_base64
        }
      });
    }

    const body = {
      contents: [
        { parts }
      ]
    };

    const geminiRes = await axios.post(
      https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY},
      body,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';

    return res.json({ success: true, reply });

  } catch (err) {
    console.error('❌ Gemini API Error:', err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: 'Gemini API error',
      details: err.response?.data || err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(🚀 Gemini API running at http://localhost:${PORT});
});