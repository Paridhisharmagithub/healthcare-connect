import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { FileText, Hospital, Pill, Calendar, Video, MessageCircle, Heart, Brain, Clock } from "lucide-react";
import React from "react";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const features = [
    { title: "Find Hospitals", desc: "Locate nearby clinics and hospitals", icon: Hospital, path: "/patient/hospitals" },
    { title: "Medicine Info", desc: "Search medicines and check availability", icon: Pill, path: "/patient/medicines" },
    { title: "Book Appointment", desc: "Schedule visits with doctors", icon: Calendar, path: "/patient/appointments" },
    { title: "Video Consultation", desc: "Connect with doctors online", icon: Video, path: "/patient/consultation" }
  ];

  const stats = [
    { label: "Reports Uploaded", value: "12", icon: FileText },
    { label: "Appointments", value: "3", icon: Calendar },
    { label: "Health Score", value: "85%", icon: Heart }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
  {/* Background gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#D4F9E9]/50 to-[#0E9F80]/25"></div>

  {/* Floating blobs */}
  <div className="absolute w-72 h-72 bg-[#D4F9E9]/30 rounded-full filter blur-3xl top-20 left-10 animate-blob"></div>
  <div className="absolute w-96 h-96 bg-[#0E9F86]/20 rounded-full filter blur-3xl top-40 right-10 animate-blob animation-delay-2000"></div>
  <div className="absolute w-72 h-72 bg-[#D4F9E9]/25 rounded-full filter blur-3xl bottom-20 left-1/3 animate-blob animation-delay-4000"></div>

  {/* Content goes here */}
  <div className="relative z-10">
<Navbar userType="patient" userName="John Doe" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#0E9F86] mb-2">Hello, John!</h1>
          <p className="text-gray-700 text-lg">Here's your health snapshot today</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-transform hover:scale-105 flex items-center gap-4">
                <div className="bg-[#0E9F86]/20 p-3 rounded-xl">
                  <Icon className="w-8 h-8 text-[#0E9F86]" />
                </div>
                <div>
                  <p className="text-gray-700 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#0E9F86]">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Assistant (OCR + Chatbot Combined) */}
        <div className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition-transform hover:scale-105 mb-12 flex flex-col md:flex-row items-center gap-8">
          <div className="bg-[#0E9F86]/10 p-6 rounded-2xl flex-shrink-0">
            <Brain className="w-16 h-16 text-[#0E9F86]" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-[#0E9F86] mb-2">AI Health Assistant</h2>
            <p className="text-gray-700 mb-4">
              Upload your medical reports or prescriptions and chat with our AI assistant to get instant insights and guidance on your health.
            </p>
            <button
              onClick={() => navigate("/patient/assistant")}
              className="bg-[#0E9F86] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0c7a6c] transition"
            >
              Launch Assistant
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-[#0E9F86] mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                onClick={() => navigate(feature.path)}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-105 transition-transform cursor-pointer flex flex-col items-center text-center gap-3"
              >
                <div className="bg-[#0E9F86]/10 p-4 rounded-xl">
                  <Icon className="w-8 h-8 text-[#0E9F86]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Health Tip */}
        {/* Upcoming Appointment / Reminder */}
<div className="mt-8 bg-white rounded-2xl p-6  shadow-lg">
  <div className=" flex items-start gap-4">
    <Clock className="text-[#0E9F86] w-8 h-8 flex-shrink-0" />
    <div>
      <h3 className="text-gray-800 text-xl font-bold mb-2">Upcoming Appointment</h3>
      <p className="text-gray-600">
        Next Appointment: <span className="font-semibold">Dr. Smith</span> on <span className="font-semibold">Nov 3, 10:00 AM</span>
      </p>
      <p className="text-gray-600 mt-1">
        Remember to keep your medical reports ready and arrive 10 minutes early.
      </p>
    </div>
  </div>
</div>

      </div>
  </div>

  {/* Styles for animation */}
  <style jsx>{`
    @keyframes blob {
      0%, 100% { transform: translate(0,0) scale(1); }
      33% { transform: translate(30px,-50px) scale(1.1); }
      66% { transform: translate(-20px,20px) scale(0.9); }
    }
    .animate-blob { animation: blob 10s infinite; }
    .animation-delay-2000 { animation-delay: 2s; }
    .animation-delay-4000 { animation-delay: 4s; }
  `}</style>
</div>


  );
}

