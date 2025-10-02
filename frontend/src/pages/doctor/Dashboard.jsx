import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Card from "../../components/Card";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const features = [
    { title: "Reports", desc: "View patient reports", path: "/doctor/reports" },
    { title: "Appointments", desc: "Manage appointments", path: "/doctor/appointments" },
    { title: "Consultation", desc: "Start video consultations", path: "/doctor/consultation" },
    { title: "Prescriptions", desc: "Add prescriptions for patients", path: "/doctor/prescriptions" }
  ];

  return (
    <div>
      <Navbar userType="doctor" />
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((f) => (
          <Card key={f.title} title={f.title} desc={f.desc} onClick={() => navigate(f.path)} />
        ))}
      </div>
    </div>
  );
}
