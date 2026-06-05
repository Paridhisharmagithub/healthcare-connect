import React, { useState } from "react";
import Navbar from "../../components/Navbar";

const Prescription = () => {
  const [patient, setPatient] = useState("");
  const [medicines, setMedicines] = useState([""]);
  const [notes, setNotes] = useState("");

  const addMedicine = () => {
    setMedicines([...medicines, ""]);
  };

  const handleMedicineChange = (index, value) => {
    const updated = [...medicines];
    updated[index] = value;
    setMedicines(updated);
  };

  const handleSubmit = () => {
    const data = { patient, medicines, notes };
    console.log("Prescription Saved:", data);
    alert("Prescription saved successfully ✅");
  };

  return (
    <div className="min-h-screen p-8 bg-[#EFFDFB] text-[#0D9688]">
      <Navbar userType="doctor" />

      <h1 className="text-4xl font-bold mb-6 text-center">
        Create Prescription
      </h1>

      <div className="bg-white shadow-lg rounded-2xl p-6 border border-[#0D9688] max-w-3xl mx-auto">

        {/* Patient */}
        <label className="block mb-2 font-semibold">Select Patient</label>
        <input
          type="text"
          value={patient}
          onChange={(e) => setPatient(e.target.value)}
          placeholder="Enter patient name"
          className="w-full p-3 border rounded-lg mb-4"
        />

        {/* Medicines */}
        <label className="block mb-2 font-semibold">Medicines</label>
        {medicines.map((med, index) => (
          <input
            key={index}
            type="text"
            value={med}
            onChange={(e) =>
              handleMedicineChange(index, e.target.value)
            }
            placeholder={`Medicine ${index + 1}`}
            className="w-full p-3 border rounded-lg mb-3"
          />
        ))}

        <button
          onClick={addMedicine}
          className="mb-4 px-4 py-2 bg-[#0D9688] text-white rounded-lg"
        >
          + Add Medicine
        </button>

        {/* Notes */}
        <label className="block mb-2 font-semibold">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional instructions..."
          className="w-full p-3 border rounded-lg mb-4"
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-[#0D9688] text-white rounded-lg hover:opacity-90"
        >
          Save Prescription
        </button>
      </div>
    </div>
  );
};

export default Prescription;