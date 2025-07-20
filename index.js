const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

app.get('/', (req, res) => {
  res.status(200).send('🤖 Gemini Vision API is online.');
});

app.get('/api/gemini', async (req, res) => {
  const prompt = req.query.prompt;
  const Imgurl = req.query.Imgurl; // direct image link
  const imgBase64 = req.query.img; // base64-encoded image string

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt.' });
  }

  try {
    const parts = [{ text: prompt }];

    if (imgBase64) {
      parts.push({
        inline_data: {
          mime_type: "image/jpeg", // or dynamic detection if needed
          data: imgBase64
        }
      });
    } else if (Imgurl) {
      const image = await axios.get(Imgurl, { responseType: 'arraybuffer' });
      const base64 = Buffer.from(image.data).toString('base64');

      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: base64
        }
      });
    }

    const body = { contents: [{ parts }] };

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`,
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const reply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
    res.json({ success: true, prompt, reply });

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Gemini Vision API running on http://localhost:${PORT}`);
});
