const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 Direct API key (ilagay dito mismo)
const GEMINI_API_KEY = "AIzaSyC7B6LYfuk-0WefeIhepnJMyebmGCLqMIg";

// ⚙️ Config
const PORT = process.env.PORT || 3000;

// 🟢 Root route
app.get("/", (req, res) => {
  res.send("🚀 Gemini Flash REST API is online!");
});

// 🧠 Gemini Flash Endpoint
app.get("/api/gemini", async (req, res) => {
  try {
    const { prompt, imageurl } = req.query;

    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' query parameter." });
    }

    // 🧩 Build request body
    const parts = [{ text: prompt }];

    // Kung may image URL, idagdag sa request
    if (imageurl) {
      parts.push({
        file_data: {
          mime_type: "image/jpeg",
          file_uri: imageurl
        }
      });
    }

    const body = {
      contents: [{ parts }]
    };

    // 📨 Send request to Gemini Flash API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      body
    );

    const output =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No response generated.";

    res.json({
      model: "gemini-1.5-flash",
      prompt,
      imageurl: imageurl || null,
      response: output
    });
  } catch (error) {
    console.error("❌ Gemini Flash Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to connect to Gemini Flash API",
      details: error.response?.data || error.message
    });
  }
});

// 🩵 Keep-alive for Render / UptimeRobot
app.get("/ping", (req, res) => res.send("pong"));

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
