# 🏥 Healthcare Connect

**Your all-in-one digital healthcare companion!**  
Book appointments, chat with an AI health assistant, upload reports, search medicines, locate hospitals, and consult doctors online — all in one platform.

---

## 🌟 Key Features

### 👩‍⚕️ Patient & Doctor Management
- Secure registration for patients and doctors.
- Track medical history and appointments.
- Approve or reject doctor registrations.

### 📅 Appointment Booking
- Book in-person or online consultations.
- View upcoming and past appointments easily.

### 🩺 AI Health Assistant
- Ask health-related questions and get instant AI advice.
- Powered by **Google Gemini API** for smart, interactive responses.

### 🧾 Medical Reports & OCR
- Upload prescriptions or lab reports.
- Extract text automatically for digital storage.

### 💊 Medicine Search
- Search by name, type, or manufacturer.
- Browse from a large medicine database.
- Check availability without payment integration.

### 🗺️ Hospital Locator
- Find nearby hospitals on an interactive map.
- View hospital addresses and services.

### 💻 Online Consultation
- Schedule and attend video consultations with doctors.
- Keep a record of all past online consultations.

---

## ⚙️ Tech Stack

### Frontend
- **React.js** – dynamic, responsive UI  
- **Tailwind CSS** – sleek and modern design  
- **Axios** – API communication  
- **Lucide-React** – icons & UI enhancements  

### Backend
- **Node.js** – API gateway for handling client requests, routing, and business logic
- **Python Flask** – AI and data-processing microservice exposing REST APIs
- **Flask-CORS** – Enables controlled cross-origin communication between services
- **Firebase Firestore** – Secure, scalable NoSQL database for users, appointments, and chat history
- **Firebase Admin SDK** – Server-side authentication and privileged database operations
- **dotenv** – Secure management of environment variables and secrets

### AI & OCR
- **Google Gemini API** – AI health assistant  
- **OCR** – text extraction from reports  

### Maps & Location
- **OpenStreetMap** – locate nearby hospitals  

---

## 🚀 Getting Started

### Backend
```bash
git clone https://github.com/Paridhisharmagithub/healthcare-connect.git
cd healthcare-connect/backend
pip install -r requirements.txt
