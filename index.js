const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 Use environment variable or fallback key
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  "AIzaSyC7B6LYfuk-0WefeIhepnJMyebmGCLqMIg";

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// 🏠 Root endpoint
app.get("/", (req, res) => {
  res.status(200).send("🤖 Gemini 2.5 Flash Vision API is online.");
});

// 🧠 Gemini 2.5 Flash endpoint
app.get("/api/gemini", async (req, res) => {
  const prompt = req.query.prompt;
  const Imgurl = req.query.Imgurl;
  const imgBase64 = req.query.img;

  if (!prompt)
    return res.status(400).json({ success: false, error: "Missing prompt." });

  try {
    const parts = [{ text: prompt }];

    // 📸 Handle image input
    if (imgBase64) {
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: imgBase64,
        },
      });
    } else if (Imgurl) {
      const image = await axios.get(Imgurl, { responseType: "arraybuffer" });
      const base64 = Buffer.from(image.data).toString("base64");

      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: base64,
        },
      });
    }

    const body = { contents: [{ parts }] };

    // 🚀 Gemini 2.5 Flash endpoint
    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    const geminiRes = await axios.post(`${endpoint}?key=${GEMINI_API_KEY}`, body, {
      headers: { "Content-Type": "application/json" },
    });

    const reply =
      geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response.";

    res.json({ success: true, prompt, reply });
  } catch (err) {
    console.error("❌ Gemini API Error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data?.error?.message || err.message,
    });
  }
});

// 🌐 Start server
app.listen(PORT, () =>
  console.log(`🚀 Gemini 2.5 Flash API running on http://localhost:${PORT}`)
);
