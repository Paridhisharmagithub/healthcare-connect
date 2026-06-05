import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";

dotenv.config();

const app = express();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

const isDev = process.env.NODE_ENV !== "production";
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (isDev && allowedOrigins.length === 0) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
  })
);
app.use(express.json());

const FLASK_URL = process.env.FLASK_AI_URL || "http://localhost:5000";

console.log("ENV:", process.env.NODE_ENV || "development");
console.log("Flask URL:", FLASK_URL);

app.get("/health", async (req, res) => {
  let flask = { ok: false };
  try {
    const r = await axios.get(`${FLASK_URL}/health`, { timeout: 5000 });
    flask = { ok: r.status === 200, ...r.data };
  } catch {
    flask = { ok: false };
  }
  res.json({ status: "ok", flask });
});

app.post("/api/chat", upload.array("files"), async (req, res) => {
  try {
    const { uid, message, history } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID required" });
    }

    const formData = new FormData();
    formData.append("uid", uid);
    formData.append("message", message || "");
    formData.append("history", history || "[]");

    if (req.files?.length > 0) {
      req.files.forEach((file) => {
        formData.append("files", file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      });
    }

    const aiRes = await axios.post(`${FLASK_URL}/ai/chat`, formData, {
      headers: {
        ...formData.getHeaders(),
        Accept: "application/json",
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 90000,
    });

    res.json(aiRes.data);
  } catch (err) {
    console.error("Chat API error:", err.message);
    res.status(500).json({
      error: "AI service failed",
      details: err.response?.data || err.message,
    });
  }
});

app.get("/api/search-medicine", async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_URL}/api/search-medicine`, {
      params: req.query,
      timeout: 60000,
    });
    res.json(response.data);
  } catch (err) {
    console.error("Medicine API error:", err.message);
    res.status(500).json({
      error: "Medicine search failed",
      details: err.response?.data || err.message,
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Node API running on port ${PORT}`);
});
