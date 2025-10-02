import { useState, useEffect } from "react";
import { getAppointments } from "../../services/api";
import Navbar from "../../components/Navbar";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(()=>{
    const fetchAppointments = async ()=>{
      const res = await getAppointments();
      setAppointments(res.data);
    };
    fetchAppointments();
  },[]);

  return (
    <div>
      <Navbar userType="doctor"/>
      <div className="p-5">
        <h2 className="text-xl font-bold mb-3">Appointments</h2>
        <ul>
          {appointments.map(a => (
            <li key={a.id} className="border p-2 rounded my-1">
              {a.patient} – {a.date} – Status: {a.status || "Pending"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
