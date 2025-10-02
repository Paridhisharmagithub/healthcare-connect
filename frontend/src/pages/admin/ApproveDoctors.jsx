import { useState, useEffect } from "react";
import { approveDoctor } from "../../services/api";
import Navbar from "../../components/Navbar";

export default function ApproveDoctors() {
  const [doctors, setDoctors] = useState([
    { uid:"1", name:"Dr. Sharma", status:"Pending"},
    { uid:"2", name:"Dr. Verma", status:"Pending"}
  ]); // ideally fetch from backend

  const handleApprove = (uid) => {
    approveDoctor(uid,"Approved");
    setDoctors(d => d.map(doc => doc.uid===uid?{...doc,status:"Approved"}:doc));
  };

  return (
    <div>
      <Navbar userType="admin"/>
      <div className="p-5">
        <h2 className="text-xl font-bold mb-3">Approve Doctors</h2>
        <ul>
          {doctors.map(d => (
            <li key={d.uid} className="border p-2 rounded my-1 flex justify-between items-center">
              {d.name} – {d.status}
              {d.status==="Pending" && <button onClick={()=>handleApprove(d.uid)} className="px-2 py-1 bg-green-500 text-white rounded">Approve</button>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
