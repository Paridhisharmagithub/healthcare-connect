import { useState, useEffect } from "react";
import { getAppointments } from "../../services/api";
import Navbar from "../../components/Navbar";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await getAppointments();
      setAppointments(res.data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 🔥 Dummy status update (replace with API later)
  const updateStatus = (index, status) => {
    const updated = [...appointments];
    updated[index].status = status;
    setAppointments(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar userType="doctor" userName="Dr. John" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-2">
            <Calendar className="w-8 h-8 text-emerald-600" />
            Patient Appointments
          </h1>
          <p className="text-gray-600">
            View and manage appointment requests
          </p>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Appointment Requests
          </h2>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No appointments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-emerald-50 rounded-xl border border-emerald-100 hover:shadow-md transition"
                >
                  {/* Left */}
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-500 rounded-full p-3">
                      <User className="w-6 h-6 text-white" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {appointment.patient || "Patient Name"}
                      </h3>

                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        {new Date(appointment.date).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    {appointment.status === "approved" ? (
                      <span className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold">
                        Approved
                      </span>
                    ) : appointment.status === "rejected" ? (
                      <span className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold">
                        Rejected
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => updateStatus(index, "approved")}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>

                        <button
                          onClick={() => updateStatus(index, "rejected")}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}