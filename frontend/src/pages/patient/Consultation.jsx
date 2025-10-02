import React from "react";

const Consultation = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Patient Consultation</h1>
      <p>Here you can view or request consultations with your doctors.</p>
      
      {/* Example table/list of consultations */}
      <div className="mt-6">
        <table className="w-full text-left border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Doctor</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">Dr. Sharma</td>
              <td className="p-2 border">2025-10-05</td>
              <td className="p-2 border">Pending</td>
            </tr>
            {/* Add more rows dynamically */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Consultation;
