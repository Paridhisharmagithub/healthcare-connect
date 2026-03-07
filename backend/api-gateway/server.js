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

// ================= Firebase Setup =================
// ================= Firebase Setup =================
let serviceAccount;

try {
  if (
    process.env.FIREBASE_SERVICE_ACCOUNT &&
    process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith("{")
  ) {
    // Production (Render) – JSON directly from env variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    // Fix private key formatting for Firebase
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }

  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Local development – read from file path
    serviceAccount = JSON.parse(
      fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT, "utf8")
    );
  } else {
    throw new Error("FIREBASE_SERVICE_ACCOUNT not provided");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase initialized successfully");

} catch (err) {
  console.error("Firebase initialization failed:", err);
}

const db = admin.firestore();

// ================= Health Check =================
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

    // Call Flask AI
    const aiRes = await axios.post(
      `${process.env.FLASK_AI_URL}/ai/chat`,
      req.body
    );

    // Save chat history
    const ref = db.collection("chat_history").doc(uid);
    const snap = await ref.get();

    const convs = snap.exists ? snap.data().conversations || [] : [];

    convs.push({
      id: String(convs.length + 1),
      title: message?.slice(0, 30) || "Conversation",
      messages: [
        { type: "user", content: message },
        { type: "ai", content: aiRes.data.response }
      ]
    });

    await ref.set({ conversations: convs }, { merge: true });

    res.json(aiRes.data);

  } catch (err) {
    console.error("AI chat error:", err.message);

    if (err.response) {
      console.error("Flask response:", err.response.data);
    }

    res.status(500).json({ error: "AI service failed" });
  }
});

// ================= Chat History =================
app.get("/api/chat-history/:uid", async (req, res) => {
  try {
    const doc = await db.collection("chat_history").doc(req.params.uid).get();

    if (!doc.exists) return res.json([]);

    res.json(doc.data().conversations || []);
  } catch (err) {
    console.error("Chat history error:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// ================= Patient Registration =================
app.post("/api/register-patient", async (req, res) => {
  try {
    await db.collection("patients").doc(req.body.uid).set(req.body);
    res.json({ status: "success" });
  } catch (err) {
    console.error("Patient registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ================= Book Appointment =================
app.post("/api/book-appointment", async (req, res) => {
  try {
    await db.collection("appointments").add(req.body);
    res.json({ status: "booked" });
  } catch (err) {
    console.error("Appointment error:", err);
    res.status(500).json({ error: "Booking failed" });
  }
});

// ================= Get Appointments =================
app.get("/api/appointments", async (req, res) => {
  try {
    const snap = await db.collection("appointments").get();
    res.json(snap.docs.map(d => d.data()));
  } catch (err) {
    console.error("Fetch appointments error:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// ================= Doctor Approval =================
app.post("/api/approve-doctor", async (req, res) => {
  try {
    const { uid, status } = req.body;

    await db.collection("doctors").doc(uid).update({ approved: status });

    res.json({ status: "updated" });
  } catch (err) {
    console.error("Doctor approval error:", err);
    res.status(500).json({ error: "Doctor approval failed" });
  }
});

// ================= Medicine Search (Proxy to Flask) =================
app.get("/api/search-medicine", async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.FLASK_AI_URL}/api/search-medicine`,
      { params: req.query }
    );

    res.json(response.data);

  } catch (err) {
    console.error("Medicine search error:", err.message);

    if (err.response) {
      console.error("Flask response:", err.response.data);
    }

    res.status(500).json({ error: "Medicine search failed" });
  }
});

// ================= Start Server =================
const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Node API running on port ${PORT}`);
});