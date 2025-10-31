import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const registerPatient = (data) => axios.post(`${API_URL}/register-patient`, data);
export const getAppointments = () => axios.get(`${API_URL}/appointments`);
export const bookAppointment = (data) => axios.post(`${API_URL}/book-appointment`, data);
export const uploadReport = (formData) => axios.post(`${API_URL}/upload-report`, formData);
export const chatWithAI = async (prompt) => {
  try {
    const res = await axios.post(`${API_URL}/ai-chat`, { prompt });
    return res;
  } catch (err) {
    console.error("AI API error:", err.response?.data || err.message);
    throw err;
  }
};

export const approveDoctor = (uid, status) => axios.post(`${API_URL}/approve-doctor`, { uid, status });

// Search medicine API
export const searchMedicine = async (name, type = "", manufacturer = "", page = 1) => {
  try {
    const res = await axios.get(`${API_URL}/search-medicine`, {
      params: { name, type, manufacturer, page },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};
