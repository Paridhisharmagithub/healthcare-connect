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
  let uid = localStorage.getItem("uid");
  if (!uid) {
    uid = "user-" + Date.now();
    localStorage.setItem("uid", uid);
  }

  const formData = new FormData();
  formData.append("uid", uid);
  formData.append("message", message);
  formData.append("history", JSON.stringify(history));

  files.forEach((file) => formData.append("files", file));

  const response = await axios.post(`${API_URL}/chat`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
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
