import axios from "axios";

// ================= ENV DETECTION =================
const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// ================= BASE URL (SAFE FALLBACK) =================
const API_URL = isLocal
  ? "http://localhost:4000/api"
  : process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/$/, "") + "/api"
  : "https://healthcare-connect-1-eg8e.onrender.com/api"; // 🔥 fallback

console.log("🌍 API URL:", API_URL);

// ================= AXIOS INSTANCE =================
const client = axios.create({
  baseURL: API_URL,
  timeout: 90000, // 🔥 increased for Render cold start
});

// ================= BASIC APIs =================
export const registerPatient = (data) =>
  client.post("/register-patient", data);

export const getAppointments = () =>
  client.get("/appointments");

export const bookAppointment = (data) =>
  client.post("/book-appointment", data);

export const approveDoctor = (uid, status) =>
  client.post("/approve-doctor", { uid, status });

// ================= MEDICINE SEARCH =================
export const searchMedicine = async (
  name,
  type = "",
  manufacturer = "",
  page = 1
) => {
  try {
    const res = await client.get("/search-medicine", {
      params: { name, type, manufacturer, page },
    });

    return res.data;

  } catch (error) {
    console.error("❌ Medicine API error:", error);

    return {
      results: [],
      error: "Medicine service temporarily unavailable",
    };
  }
};

// ================= CHAT =================
export const chatWithAI = async (
  message,
  history = [],
  files = []
) => {
  try {
    let uid = localStorage.getItem("uid");

    if (!uid) {
      uid = "user-" + Date.now();
      localStorage.setItem("uid", uid);
    }

    const formData = new FormData();
    formData.append("uid", uid);
    formData.append("message", message);
    formData.append("history", JSON.stringify(history));

    if (files && files.length > 0) {
      files.forEach((file) => formData.append("files", file));
    }

    const response = await axios.post(
      `${API_URL}/chat`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000, // 🔥 AI + OCR safe
      }
    );

    return response.data;

  } catch (error) {
    console.error("❌ Chat API error:", error);

    return {
      response: "Server busy. Try again in a few seconds.",
      is_emergency: false,
    };
  }
};

// ================= EXPORT =================
const apiService = {
  registerPatient,
  getAppointments,
  bookAppointment,
  approveDoctor,
  searchMedicine,
  chatWithAI,
};

export default apiService;