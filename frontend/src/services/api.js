import axios from "axios";
import { auth } from "../firebase";

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const prodApiBase = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/$/, "") + "/api"
  : null;

if (!isLocal && !prodApiBase) {
  console.error(
    "REACT_APP_API_URL is required for production builds (e.g. your Cloud Run API gateway URL)."
  );
}

const API_URL = isLocal
  ? "http://localhost:4000/api"
  : prodApiBase || "http://localhost:4000/api";

const client = axios.create({
  baseURL: API_URL,
  timeout: 90000,
});

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
    console.error("Medicine API error:", error);
    return {
      results: [],
      error: "Medicine service temporarily unavailable",
    };
  }
};

export const chatWithAI = async (message, history = [], files = []) => {
  try {
    const uid =
      auth.currentUser?.uid ||
      localStorage.getItem("uid") ||
      "guest-" + Date.now();

    const formData = new FormData();
    formData.append("uid", uid);
    formData.append("message", message);
    formData.append("history", JSON.stringify(history));

    if (files?.length > 0) {
      files.forEach((file) => formData.append("files", file));
    }

    const response = await axios.post(`${API_URL}/chat`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });

    return response.data;
  } catch (error) {
    console.error("Chat API error:", error);
    return {
      response: "Server busy. Try again in a few seconds.",
      is_emergency: false,
    };
  }
};

const apiService = { searchMedicine, chatWithAI };
export default apiService;
