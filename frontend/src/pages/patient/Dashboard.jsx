import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Card from "../../components/Card";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const features = [
    { title: "Upload Report", desc: "Upload medical reports for AI analysis", path: "/patient/upload-report" },
    { title: "Hospitals Nearby", desc: "Find nearby hospitals and clinics", path: "/patient/hospitals" },
    { title: "Medicines", desc: "Search US drug info via OpenFDA", path: "/patient/medicines" },
    { title: "Appointments", desc: "Book and manage appointments", path: "/patient/appointments" },
    { title: "Video Consultation", desc: "Join video calls with doctors", path: "/patient/consultation" },
    { title: "AI Health Assistant", desc: "Chat with AI about health queries", path: "/patient/assistant" }
  ];

  return (
    <div>
      <Navbar userType="patient" />
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <Card key={f.title} title={f.title} desc={f.desc} onClick={() => navigate(f.path)} />
        ))}
      </div>
    </div>
  );
}
