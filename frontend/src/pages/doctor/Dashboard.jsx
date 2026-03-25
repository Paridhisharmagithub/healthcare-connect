import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  Users,
  Calendar,
  FileText,
  Video,
  Brain,
  Clock,
  Stethoscope,
  AlertTriangle,
} from "lucide-react";
import React from "react";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Appointments",
      desc: "Manage patient appointments",
      icon: Calendar,
      path: "/doctor/appointments",
    },
    {
      title: "Patients",
      desc: "View patient records & history",
      icon: Users,
      path: "/doctor/patients",
    },
    {
      title: "Prescriptions",
      desc: "Create & manage prescriptions",
      icon: FileText,
      path: "/doctor/prescriptions",
    },
    {
      title: "Video Consultation",
      desc: "Start online consultation",
      icon: Video,
      path: "/doctor/consultation",
    },
  ];

  const stats = [
    { label: "Total Patients", value: "120", icon: Users },
    { label: "Today's Appointments", value: "8", icon: Calendar },
    { label: "Pending Requests", value: "5", icon: Clock },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4F9E9]/50 to-[#0E9F80]/25"></div>

      {/* Floating blobs */}
      <div className="absolute w-72 h-72 bg-[#D4F9E9]/30 rounded-full blur-3xl top-20 left-10 animate-blob"></div>
      <div className="absolute w-96 h-96 bg-[#0E9F86]/20 rounded-full blur-3xl top-40 right-10 animate-blob animation-delay-2000"></div>

      <div className="relative z-10">
        <Navbar userType="doctor"/>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Welcome */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#0E9F86] mb-2">
              Welcome, Doctor
            </h1>
            <p className="text-gray-700 text-lg">
              Manage your patients and consultations efficiently
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition hover:scale-105 flex items-center gap-4"
                >
                  <div className="bg-[#0E9F86]/20 p-3 rounded-xl">
                    <Icon className="w-8 h-8 text-[#0E9F86]" />
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#0E9F86]">
                      {stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Assistant */}
          <div className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition hover:scale-105 mb-12 flex flex-col md:flex-row items-center gap-8">
            <div className="bg-[#0E9F86]/10 p-6 rounded-2xl">
              <Brain className="w-16 h-16 text-[#0E9F86]" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-[#0E9F86] mb-2">
                AI Medical Assistant
              </h2>
              <p className="text-gray-700 mb-4">
                Analyze patient reports, prescriptions, and get AI insights
                instantly.
              </p>
              <button
                onClick={() => navigate("/doctor/assistant")}
                className="bg-[#0E9F86] text-white px-6 py-3 rounded-xl hover:bg-[#0c7a6c]"
              >
                Open Assistant
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <h2 className="text-2xl font-bold text-[#0E9F86] mb-6">
            Doctor Tools
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  onClick={() => navigate(feature.path)}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-105 transition cursor-pointer flex flex-col items-center text-center gap-3"
                >
                  <div className="bg-[#0E9F86]/10 p-4 rounded-xl">
                    <Icon className="w-8 h-8 text-[#0E9F86]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Emergency Alerts */}
          <div className="mt-10 bg-white rounded-2xl p-6 shadow-lg flex gap-4 items-start">
            <AlertTriangle className="text-red-500 w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Emergency Alerts
              </h3>
              <p className="text-gray-600">
                2 patients flagged with critical symptoms. Immediate attention required.
              </p>
            </div>
          </div>

          {/* Upcoming */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg flex gap-4 items-start">
            <Clock className="text-[#0E9F86] w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Next Appointment
              </h3>
              <p className="text-gray-600">
                Patient: <b>Rahul Sharma</b> at <b>2:30 PM</b>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-50px) scale(1.1); }
          66% { transform: translate(-20px,20px) scale(0.9); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}