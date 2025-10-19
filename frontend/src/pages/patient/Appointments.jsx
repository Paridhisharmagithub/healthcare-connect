import { useState, useEffect } from "react";
import { getAppointments, bookAppointment } from "../../services/api";
import Navbar from "../../components/Navbar";
import { Calendar, Clock, User, Plus, CheckCircle, XCircle, Loader } from "lucide-react";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

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

  const handleBook = async () => {
    if (!doctor || !date) return alert("Please fill all fields");
    setLoading(true);
    try {
      await bookAppointment({ doctor, date });
      await fetchAppointments();
      setDoctor("");
      setDate("");
      setShowForm(false);
      alert("Appointment booked successfully!");
    } catch (error) {
      alert("Booking failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar userType="patient" userName="John Doe" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Calendar className="w-8 h-8 text-emerald-600" />
              My Appointments
            </h1>
            <p className="text-gray-600">Manage your doctor appointments</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            Book New
          </button>
        </div>

        {/* Booking Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Book New Appointment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Doctor Name</label>
                <input
                  type="text"
                  placeholder="Enter doctor's name"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBook}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm Booking
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointments List */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Upcoming Appointments</h2>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No appointments scheduled yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-emerald-600 font-semibold hover:text-emerald-700"
              >
                Book your first appointment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.uid}
                  className="flex items-center justify-between p-6 bg-emerald-50 rounded-xl border border-emerald-100 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-500 rounded-full p-3">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Dr. {appointment.doctor || appointment.patient}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        {new Date(appointment.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold">
                    Scheduled
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
