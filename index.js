const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get('/api/gemini', async (req, res) => {
  const prompt = req.query.prompt;
  const Imgurl = req.query.Imgurl;

  if (!prompt && !Imgurl) {
    return res.status(400).json({ error: 'Missing prompt or Imgurl' });
  }

  try {
    const parts = [{ text: prompt || 'Describe this image.' }];

    if (Imgurl) {
      // Download the image and convert to base64
      const imgRes = await axios.get(Imgurl, { responseType: 'arraybuffer' });
      const base64 = Buffer.from(imgRes.data).toString('base64');

      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: base64
        }
      });
    }

    const body = {
      contents: [{ parts }]
    };

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const reply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
    res.json({ success: true, prompt, image: Imgurl || null, reply });

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Gemini URL API running at http://localhost:${PORT}`);
});