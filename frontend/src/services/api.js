import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const registerPatient = (data) => axios.post(`${API_URL}/register-patient`, data);
export const getAppointments = () => axios.get(`${API_URL}/appointments`);
export const bookAppointment = (data) => axios.post(`${API_URL}/book-appointment`, data);
export const uploadReport = (formData) => axios.post(`${API_URL}/upload-report`, formData);
export const searchDrug = (q) => axios.get(`${API_URL}/search-drug?q=${q}`);
export const chatWithAI = (prompt) => axios.post(`${API_URL}/ai-chat`, { prompt });
export const approveDoctor = (uid, status) => axios.post(`${API_URL}/approve-doctor`, { uid, status });
