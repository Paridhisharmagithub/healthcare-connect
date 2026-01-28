import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import axios from "axios";
import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

const app = express();
const upload = multer();
app.use(cors());
app.use(express.json());

// ---------------- Firebase ----------------
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT))
  )
});
const db = admin.firestore();

// ---------------- Health ----------------
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ---------------- CHAT ----------------
app.post("/api/chat", upload.array("files"), async (req, res) => {
  try {
    const { uid, message, history } = req.body;
    if (!uid) return res.status(400).json({ error: "UID required" });

    // Call Flask AI
    const aiRes = await axios.post(
      `${process.env.FLASK_AI_URL}/ai/chat`,
      req.body,
      { headers: req.headers }
    );

    // Save chat
    const ref = db.collection("chat_history").doc(uid);
    const snap = await ref.get();
    const convs = snap.exists ? snap.data().conversations : [];

    convs.push({
      id: String(convs.length + 1),
      title: message?.slice(0, 30),
      messages: [
        { type: "user", content: message },
        { type: "ai", content: aiRes.data.response }
      ]
    });

    await ref.set({ conversations: convs }, { merge: true });

    res.json(aiRes.data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI service failed" });
  }
});

// ---------------- CHAT HISTORY ----------------
app.get("/api/chat-history/:uid", async (req, res) => {
  const doc = await db.collection("chat_history").doc(req.params.uid).get();
  res.json(doc.exists ? doc.data().conversations : []);
});

// ---------------- PATIENTS ----------------
app.post("/api/register-patient", async (req, res) => {
  await db.collection("patients").doc(req.body.uid).set(req.body);
  res.json({ status: "success" });
});

// ---------------- APPOINTMENTS ----------------
app.post("/api/book-appointment", async (req, res) => {
  await db.collection("appointments").add(req.body);
  res.json({ status: "booked" });
});

app.get("/api/appointments", async (req, res) => {
  const snap = await db.collection("appointments").get();
  res.json(snap.docs.map(d => d.data()));
});

// ---------------- DOCTOR ----------------
app.post("/api/approve-doctor", async (req, res) => {
  const { uid, status } = req.body;
  await db.collection("doctors").doc(uid).update({ approved: status });
  res.json({ status: "updated" });
});

app.get("/api/search-medicine", async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.FLASK_AI_URL}/api/search-medicine`,
      { params: req.query }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Medicine search failed" });
  }
});



const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Node API running on port ${PORT}`);
});
