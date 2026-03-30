import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import axios from "axios";
import admin from "firebase-admin";
import FormData from "form-data";

dotenv.config();

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

// 🌍 ENV BASED FLASK URL (FINAL)
const FLASK_URL =
  process.env.FLASK_AI_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://healthcare-connect-97o7.onrender.com"
    : "http://localhost:5000");

console.log("🌍 ENV:", process.env.NODE_ENV);
console.log("🔗 Using Flask URL:", FLASK_URL);

// ================= Firebase =================
let db = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    serviceAccount.private_key =
      serviceAccount.private_key.replace(/\\n/g, "\n");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    db = admin.firestore();
    console.log("✅ Firebase initialized");
  } else {
    console.log("⚠️ Firebase not configured");
  }
} catch (err) {
  console.error("❌ Firebase init failed:", err.message);
}

// ================= Health =================
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ================= CHAT =================
app.post("/api/chat", upload.array("files"), async (req, res) => {
  try {
    const { uid, message, history } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID required" });
    }

    console.log("👉 Files:", req.files?.length || 0);
    console.log("👉 Message:", message);

    const formData = new FormData();
    formData.append("uid", uid);
    formData.append("message", message || "");
    formData.append("history", history || "[]");

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        formData.append("files", file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      });
    }

    console.log("👉 Calling Flask:", `${FLASK_URL}/ai/chat`);

    const aiRes = await axios.post(
      `${FLASK_URL}/ai/chat`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 90000,
      }
    );

    // Save chat (optional)
    if (db) {
      const ref = db.collection("chat_history").doc(uid);
      const snap = await ref.get();

      const convs = snap.exists ? snap.data().conversations || [] : [];

      convs.push({
        id: String(convs.length + 1),
        title: message?.slice(0, 30) || "Chat",
        messages: [
          { type: "user", content: message },
          { type: "ai", content: aiRes.data.response },
        ],
      });

      await ref.set({ conversations: convs }, { merge: true });
    }

    res.json(aiRes.data);

  } catch (err) {
    console.error("❌ Chat API error:", err.message);

    if (err.response) {
      console.error("🔥 Flask status:", err.response.status);
      console.error("🔥 Flask data:", err.response.data);
    }

    res.status(500).json({
      error: "AI service failed",
      details: err.response?.data || err.message,
    });
  }
});

// ================= MEDICINE =================
app.get("/api/search-medicine", async (req, res) => {
  try {
    console.log("👉 Query:", req.query);
    console.log("👉 Calling Flask:", `${FLASK_URL}/api/search-medicine`);

    const response = await axios.get(
      `${FLASK_URL}/api/search-medicine`,
      {
        params: req.query,
        timeout: 60000,
      }
    );

    res.json(response.data);

  } catch (err) {
    console.error("❌ Medicine API error:", err.message);

    if (err.response) {
      console.error("🔥 Flask status:", err.response.status);
      console.error("🔥 Flask data:", err.response.data);
    }

    res.status(500).json({
      error: "Medicine search failed",
      details: err.response?.data || err.message,
    });
  }
});

// ================= START =================
const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Node API running on port ${PORT}`);
});