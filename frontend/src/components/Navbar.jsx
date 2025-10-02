import { Link } from "react-router-dom";

export default function Navbar({ userType }) {
  const menu = {
    patient: [
      { name: "Dashboard", path: "/patient" },
      { name: "Upload Report", path: "/patient/upload-report" },
      { name: "Hospitals", path: "/patient/hospitals" },
      { name: "Medicines", path: "/patient/medicines" },
      { name: "Appointments", path: "/patient/appointments" },
      { name: "Consultation", path: "/patient/consultation" },
      { name: "Assistant", path: "/patient/assistant" }
    ],
    doctor: [
      { name: "Dashboard", path: "/doctor" },
      { name: "Reports", path: "/doctor/reports" },
      { name: "Appointments", path: "/doctor/appointments" },
      { name: "Consultation", path: "/doctor/consultation" },
      { name: "Prescriptions", path: "/doctor/prescriptions" }
    ],
    admin: [
      { name: "Dashboard", path: "/admin" },
      { name: "Approve Doctors", path: "/admin/approve-doctors" },
      { name: "Manage Users", path: "/admin/manage-users" }
    ]
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="font-bold text-lg">Healthcare Connect</div>
      <div className="space-x-4">
        {menu[userType].map((m) => (
          <Link key={m.path} to={m.path} className="hover:underline">{m.name}</Link>
        ))}
      </div>
    </nav>
  );
}
