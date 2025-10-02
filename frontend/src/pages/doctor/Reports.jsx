import { useEffect, useState } from "react";
import { getAppointments } from "../../services/api";
import Navbar from "../../components/Navbar";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const res = await getAppointments(); // you can create separate endpoint for reports if needed
      setReports(res.data);
    };
    fetchReports();
  }, []);

  return (
    <div>
      <Navbar userType="doctor"/>
      <div className="p-5">
        <h2 className="text-xl font-bold mb-3">Patient Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(r => (
            <div key={r.id} className="p-3 border rounded shadow">
              <h3 className="font-bold">{r.patient || "Unknown Patient"}</h3>
              <p>{r.date}</p>
              <a href={r.file_url} target="_blank" className="text-blue-600 underline">View Report</a>
              <pre className="mt-2 text-gray-700">{r.ocr_text}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
