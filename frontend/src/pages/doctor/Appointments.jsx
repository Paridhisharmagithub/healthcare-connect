import { useState, useEffect } from "react";
import {
  listDoctorAppointments,
  updateAppointmentStatus,
} from "../../services/appointments";
import Navbar from "../../components/Navbar";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      const list = await listDoctorAppointments();
      setAppointments(list);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (appointmentId, status) => {
    setLoading(true);
    try {
      await updateAppointmentStatus(appointmentId, status);
      await fetchAppointments();
    } catch (error) {
      alert("Could not update appointment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar userType="doctor" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-2">
            <Calendar className="w-8 h-8 text-emerald-600" />
            Patient Appointments
          </h1>
          <p className="text-gray-600">
            Requests where the patient entered your registered name
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Appointment Requests
          </h2>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No appointments yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Patients must book using your exact registered name.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-emerald-50 rounded-xl border border-emerald-100 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-500 rounded-full p-3">
                      <User className="w-6 h-6 text-white" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {appointment.patientName || "Patient"}
                      </h3>

                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        {new Date(appointment.date).toLocaleString()}
                      </p>
                    </div>
                  </div>

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
                          disabled={loading}
                          onClick={() => updateStatus(appointment.id, "approved")}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>

                        <button
                          disabled={loading}
                          onClick={() => updateStatus(appointment.id, "rejected")}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
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
