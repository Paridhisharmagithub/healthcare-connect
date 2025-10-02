import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Card from "../../components/Card";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const features = [
    { title: "Approve Doctors", desc: "Approve or reject doctor registrations", path: "/admin/approve-doctors" },
    { title: "Manage Users", desc: "View & manage all patients and doctors", path: "/admin/manage-users" }
  ];

  return (
    <div>
      <Navbar userType="admin"/>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map(f => (
          <Card key={f.title} title={f.title} desc={f.desc} onClick={()=>navigate(f.path)} />
        ))}
      </div>
    </div>
  );
}
