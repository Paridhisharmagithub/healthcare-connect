import axios from "axios";

const RAW = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = RAW.replace(/\/+$/, "").endsWith("/api")
  ? RAW.replace(/\/+$/, "")
  : RAW.replace(/\/+$/, "") + "/api";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

export const registerPatient = (data) => client.post("/register-patient", data);
export const getAppointments = () => client.get("/appointments");
export const bookAppointment = (data) => client.post("/book-appointment", data);
export const searchMedicine = async (name, type = "", manufacturer = "", page = 1) => {
  const res = await client.get("/search-medicine", { params: { name, type, manufacturer, page } });
  return res.data;
};
export const approveDoctor = (uid, status) => client.post("/approve-doctor", { uid, status });

// -------------------- Chat with optional file attachments --------------------
export const chatWithAI = async (message, history = [], files = []) => {
  if (files.length === 0) {
    const res = await client.post("/chat", { message, history });
    return res.data;
  }

  const formData = new FormData();
  formData.append("message", message);
  formData.append("history", JSON.stringify(history));
  files.forEach((f) => formData.append("files", f));

  const res = await axios.post(`${API_URL}/chat`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });

  return res.data;
};

export const uploadReport = (formData) =>
  axios.post(`${API_URL}/upload-report`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default {
  registerPatient,
  getAppointments,
  bookAppointment,
  searchMedicine,
  approveDoctor,
  chatWithAI,
  uploadReport,
};
