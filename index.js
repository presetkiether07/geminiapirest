const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyC7B6LYfuk-0WefeIhepnJMyebmGCLqMIg';

app.get('/', (req, res) => {
  res.status(200).send('🤖 Gemini Vision API is online.');
});

app.post('/api/gemini', async (req, res) => {
  const { prompt, Imgurl, img } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt.' });
  }

  try {
    const parts = [{ text: prompt }];

    // If base64 provided directly
    if (img) {
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: img
        }
      });
    }
    // If image URL provided
    else if (Imgurl) {
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

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
    res.json({ success: true, prompt, reply });

  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Gemini Vision API running on http://localhost:${PORT}`);
});
