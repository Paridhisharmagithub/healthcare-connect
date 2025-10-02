import { useState } from "react";
import Navbar from "../../components/Navbar";

export default function Prescriptions() {
  const [patient, setPatient] = useState("");
  const [prescription, setPrescription] = useState("");

  const handleAdd = async () => {
    // Call backend to save prescription
    alert(`Prescription added for ${patient}`);
    setPatient(""); setPrescription("");
  };

  return (
    <div>
      <Navbar userType="doctor"/>
      <div className="p-5">
        <h2 className="text-xl font-bold mb-3">Add Prescription</h2>
        <input type="text" placeholder="Patient Name" value={patient} onChange={e=>setPatient(e.target.value)} className="border p-2 rounded w-full mb-2"/>
        <textarea placeholder="Prescription Details" value={prescription} onChange={e=>setPrescription(e.target.value)} className="border p-2 rounded w-full mb-2"/>
        <button onClick={handleAdd} className="px-3 py-1 bg-blue-500 text-white rounded">Add Prescription</button>
      </div>
    </div>
  );
}
