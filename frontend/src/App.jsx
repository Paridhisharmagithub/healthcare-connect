// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import RegisterPatient from "./pages/RegisterPatient";
import RegisterDoctor from "./pages/RegisterDoctor";

// Patient pages
import PatientDashboard from "./pages/patient/Dashboard";
import UploadReport from "./pages/patient/UploadReport";
import Hospitals from "./pages/patient/Hospitals";
import Medicines from "./pages/patient/Medicines";
import PatientAppointments from "./pages/patient/Appointments";
import PatientConsultation from "./pages/patient/Consultation";
import Assistant from "./pages/patient/Assistant";

// Doctor pages
import DoctorDashboard from "./pages/doctor/Dashboard";
import Reports from "./pages/doctor/Reports";
import DoctorAppointments from "./pages/doctor/Appointments";
import DoctorConsultation from "./pages/doctor/Consultation";
import Prescriptions from "./pages/doctor/Prescriptions";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import ApproveDoctors from "./pages/admin/ApproveDoctors";
import ManageUsers from "./pages/admin/ManageUsers";

// Components & Context
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-patient" element={<RegisterPatient />} />
          <Route path="/register-doctor" element={<RegisterDoctor />} />

          {/* Patient routes */}
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/upload-report" element={<UploadReport />} />
          <Route path="/patient/hospitals" element={<Hospitals />} />
          <Route path="/patient/medicines" element={<Medicines />} />
          <Route path="/patient/appointments" element={<PatientAppointments />} />
          <Route path="/patient/consultation" element={<PatientConsultation />} />
          <Route path="/patient/assistant" element={<Assistant />} />

          {/* Doctor routes */}
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/reports" element={<Reports />} />
          <Route path="/doctor/appointments" element={<DoctorAppointments />} />
          <Route path="/doctor/consultation" element={<DoctorConsultation />} />
          <Route path="/doctor/prescriptions" element={<Prescriptions />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/approve-doctors" element={<ApproveDoctors />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
