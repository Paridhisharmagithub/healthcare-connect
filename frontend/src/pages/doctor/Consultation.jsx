import React from "react";

const Consultation = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Doctor Consultation</h1>
      <p>Here you can view all patient consultations assigned to you.</p>

      {/* Example table/list of consultations */}
      <div className="mt-6">
        <table className="w-full text-left border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Patient</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">Paridhi Sharma</td>
              <td className="p-2 border">2025-10-05</td>
              <td className="p-2 border">Confirmed</td>
            </tr>
            {/* Add more rows dynamically */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Consultation;
