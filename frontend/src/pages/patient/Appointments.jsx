import { useState, useEffect } from "react";
import { getAppointments, bookAppointment } from "../../services/api";
import Navbar from "../../components/Navbar";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctor,setDoctor] = useState("");
  const [date,setDate] = useState("");

  const fetchAppointments = async () => {
    const res = await getAppointments(); // now real-time Firestore data
    setAppointments(res.data);
  }

  useEffect(()=>{ fetchAppointments() },[]);

  const handleBook = async () => {
    await bookAppointment({ doctor, date }); // saves to Firestore
    fetchAppointments();
  }

  return (
    <div>
      <Navbar userType="patient"/>
      <div className="p-5">
        <input type="text" placeholder="Doctor Name" value={doctor} onChange={e=>setDoctor(e.target.value)} className="border p-2 rounded mr-2"/>
        <input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} className="border p-2 rounded mr-2"/>
        <button onClick={handleBook} className="px-3 py-1 bg-blue-500 text-white rounded">Book</button>

        <h3 className="mt-5 font-bold">Upcoming Appointments</h3>
        <ul className="mt-2">
          {appointments.map(a => <li key={a.uid} className="border p-2 rounded my-1">{a.patient} – {a.date}</li>)}
        </ul>
      </div>
    </div>
  );
}
