import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "25mb" }));

// Your Gemini API key
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  "AIzaSyC7B6LYfuk-0WefeIhepnJMyebmGCLqMIg";

// Default route
app.get("/", (req, res) => {
  res.status(200).send("🤖 Gemini 2.5-Pro Vision API is online.");
});

// Main endpoint
app.post("/api/gemini", async (req, res) => {
  const { prompt, Imgurl, img } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: "Missing prompt." });
  }

  try {
    const parts = [{ text: prompt }];

    // If base64 image is provided
    if (img) {
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: img,
        },
      });
    }

    // If image URL is provided
    else if (Imgurl) {
      const image = await axios.get(Imgurl, { responseType: "arraybuffer" });
      const base64 = Buffer.from(image.data).toString("base64");
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: base64,
        },
      });
    }

    const body = {
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    };

    // Use gemini-2.5-pro model
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.";

    res.json({
      success: true,
      model: "gemini-2.5-pro",
      prompt,
      reply,
    });
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Gemini 2.5-Pro API running on http://localhost:${PORT}`);
});
