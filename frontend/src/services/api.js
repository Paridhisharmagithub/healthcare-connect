// src/services/api.js
import axios from "axios";

const RAW = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = RAW.replace(/\/+$/, "").endsWith("/api")
  ? RAW.replace(/\/+$/, "")
  : RAW.replace(/\/+$/, "") + "/api";

// Optional: create an axios instance for defaults (timeout, headers)
const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30s
});

// Patient APIs
export const registerPatient = (data) => client.post("/register-patient", data);
export const getAppointments = () => client.get("/appointments");
export const bookAppointment = (data) => client.post("/book-appointment", data);
export const uploadReport = (formData) =>
  axios.post(`${API_URL}/upload-report`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Chat
export const chatWithAI = async (message, history = []) => {
  const res = await client.post("/chat", { message, history });
  return res.data;
};

// Admin / other
export const approveDoctor = (uid, status) =>
  client.post("/approve-doctor", { uid, status });

export const searchMedicine = async (name, type = "", manufacturer = "", page = 1) => {
  const res = await client.get("/search-medicine", {
    params: { name, type, manufacturer, page },
  });
  return res.data;
};

// default export optional
export default {
  registerPatient,
  getAppointments,
  bookAppointment,
  uploadReport,
  chatWithAI,
  approveDoctor,
  searchMedicine,
};
