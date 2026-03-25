import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import axios from "axios";
import admin from "firebase-admin";

dotenv.config();

const app = express();
const upload = multer();

// Middleware
app.use(cors());
app.use(express.json());

// 🔥 Global Flask URL (works local + deployed)
const FLASK_URL = process.env.FLASK_AI_URL || "http://localhost:5000";
console.log("Using Flask URL:", FLASK_URL);

// ================= Firebase Setup =================
let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    // fix newline issue
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase initialized");
  } else {
    console.log("⚠️ Firebase not configured (running without DB)");
  }
} catch (err) {
  console.error("❌ Firebase init failed:", err.message);
}

const db = admin.apps.length ? admin.firestore() : null;

// ================= Health =================
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ================= Chat API =================

app.post("/api/chat", upload.array("files"), async (req, res) => {
  try {
    const { uid, message, history } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID required" });
    }

    console.log("👉 Incoming files:", req.files?.length || 0);
    console.log("👉 Using Flask URL:", FLASK_URL);

    const formData = new FormData();

    formData.append("uid", uid);
    formData.append("message", message || "");
    formData.append("history", history || "[]");

    // ✅ attach files
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        formData.append("files", file.buffer, file.originalname);
      });
    }

    // ✅ send correct data
    const aiRes = await axios.post(
      `${FLASK_URL}/ai/chat`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 90000,
      }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("❌ AI chat error:", err.message);

    if (err.response) {
      console.error("🔥 Flask response:", err.response.data);
    }

    res.status(500).json({
      error: "AI service failed",
      details: err.message,
    });
  }
});

// ================= Chat History =================
app.get("/api/chat-history/:uid", async (req, res) => {
  try {
    if (!db) return res.json([]);

    const doc = await db.collection("chat_history").doc(req.params.uid).get();
    res.json(doc.exists ? doc.data().conversations : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// ================= Medicine Search =================
app.get("/api/search-medicine", async (req, res) => {
  try {
    console.log("👉 Query:", req.query);

    const response = await axios.get(`${FLASK_URL}/api/search-medicine`, {
      params: req.query,
      timeout: 60000,
    });

    console.log("✅ Flask responded");

    res.json(response.data);

  } catch (err) {
    console.error("❌ Medicine API error:", err.message);

    if (err.response) {
      console.error("🔥 Flask error:", err.response.data);
    }

    res.status(500).json({
      error: "Medicine search failed",
      details: err.message,
    });
  }
});
// ================= Start Server =================
const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Node API running on port ${PORT}`);
});