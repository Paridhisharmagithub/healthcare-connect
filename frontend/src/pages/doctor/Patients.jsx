import React, { useState } from "react";
import Navbar from "../../components/Navbar";

const Patients = () => {
  const [search, setSearch] = useState("");

  const patients = [
    { id: 1, name: "John Doe", age: 25, status: "Active" },
    { id: 2, name: "Riya Sharma", age: 30, status: "Inactive" },
    { id: 3, name: "Aman Verma", age: 28, status: "Active" },
  ];

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8 bg-[#EFFDFB] text-[#0D9688]">
      <Navbar userType="doctor" userName="Dr. Smith" />

      <h1 className="text-4xl font-bold mb-6 text-center">
        Patients
      </h1>

      {/* Search */}
      <div className="mb-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-[#0D9688]">
        <table className="w-full border-collapse text-left border border-gray-200">
          <thead className="bg-[#0D9688] text-white">
            <tr>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Age</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-[#EFFDFB] transition">
                <td className="p-3 border">{p.name}</td>
                <td className="p-3 border">{p.age}</td>
                <td
                  className={`p-3 border ${
                    p.status === "Active"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {p.status}
                </td>
                <td className="p-3 border text-center">
                  <button className="px-4 py-2 bg-[#0D9688] text-white rounded-lg hover:opacity-90">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Patients;