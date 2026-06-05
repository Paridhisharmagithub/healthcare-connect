import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import RegisterPatient from "./pages/RegisterPatient";
import RegisterDoctor from "./pages/RegisterDoctor";

import PatientDashboard from "./pages/patient/Dashboard";
import Hospitals from "./pages/patient/Hospitals";
import Medicines from "./pages/patient/Medicines";
import PatientAppointments from "./pages/patient/Appointments";
import PatientConsultation from "./pages/patient/Consultation";
import Assistant from "./pages/patient/Assistant";

import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorAppointments from "./pages/doctor/Appointments";
import DoctorConsultation from "./pages/doctor/Consultation";
import Prescriptions from "./pages/doctor/Prescriptions";
import Patients from "./pages/doctor/Patients";
import DoctorAssistant from "./pages/doctor/Assistant";

import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register-patient" element={<RegisterPatient />} />
      <Route path="/register-doctor" element={<RegisterDoctor />} />

      <Route
        path="/patient/dashboard"
        element={
          <PrivateRoute role="patient">
            <PatientDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/hospitals"
        element={
          <PrivateRoute role="patient">
            <Hospitals />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/medicines"
        element={
          <PrivateRoute role="patient">
            <Medicines />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <PrivateRoute role="patient">
            <PatientAppointments />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/consultation"
        element={
          <PrivateRoute role="patient">
            <PatientConsultation />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/assistant"
        element={
          <PrivateRoute role="patient">
            <Assistant />
          </PrivateRoute>
        }
      />

      <Route
        path="/doctor/dashboard"
        element={
          <PrivateRoute role="doctor">
            <DoctorDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <PrivateRoute role="doctor">
            <Patients />
          </PrivateRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <PrivateRoute role="doctor">
            <DoctorAppointments />
          </PrivateRoute>
        }
      />
      <Route
        path="/doctor/consultation"
        element={
          <PrivateRoute role="doctor">
            <DoctorConsultation />
          </PrivateRoute>
        }
      />
      <Route
        path="/doctor/prescriptions"
        element={
          <PrivateRoute role="doctor">
            <Prescriptions />
          </PrivateRoute>
        }
      />
      <Route
        path="/doctor/assistant"
        element={
          <PrivateRoute role="doctor">
            <DoctorAssistant />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
