import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  FileText,
  Hospital,
  Pill,
  Calendar,
  Video,
  MessageCircle,
  Activity,
  Clock,
  TrendingUp,
  Heart
} from "lucide-react";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Upload Medical Report",
      desc: "Get instant AI-powered analysis of your medical reports in simple language",
      icon: FileText,
      path: "/patient/upload-report",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600"
    },
    {
      title: "Find Hospitals",
      desc: "Locate nearby hospitals, clinics, and healthcare facilities on map",
      icon: Hospital,
      path: "/patient/hospitals",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Medicine Information",
      desc: "Search for medicines, check availability, and get detailed drug information",
      icon: Pill,
      path: "/patient/medicines",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      title: "Book Appointment",
      desc: "Schedule appointments with verified doctors and manage your visits",
      icon: Calendar,
      path: "/patient/appointments",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      title: "Video Consultation",
      desc: "Connect with doctors through secure video calls from anywhere",
      icon: Video,
      path: "/patient/consultation",
      color: "from-teal-500 to-emerald-600",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600"
    },
    {
      title: "AI Health Assistant",
      desc: "Get instant answers to your health questions from our AI chatbot",
      icon: MessageCircle,
      path: "/patient/assistant",
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600"
    }
  ];

  const stats = [
    { label: "Total Reports", value: "12", icon: FileText, color: "text-emerald-600" },
    { label: "Appointments", value: "3", icon: Calendar, color: "text-blue-600" },
    { label: "Health Score", value: "85%", icon: Activity, color: "text-purple-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar userType="patient" userName="John Doe" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, John! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your health today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.color} bg-opacity-10 p-3 rounded-xl`}>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                onClick={() => navigate(feature.path)}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:scale-105"
              >
                {/* Icon */}
                <div className={`${feature.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {feature.desc}
                </p>

                {/* CTA */}
                <div className={`inline-flex items-center text-sm font-semibold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent group-hover:gap-2 transition-all`}>
                  Get Started
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Recent Activity
            </h2>
            <button className="text-emerald-600 text-sm font-medium hover:text-emerald-700">
              View All
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-xl">
              <FileText className="w-5 h-5 text-emerald-600" />
              <div className="flex-1">
                <p className="text-gray-800 font-medium">Blood Test Report Uploaded</p>
                <p className="text-gray-500 text-sm">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-gray-800 font-medium">Appointment with Dr. Smith</p>
                <p className="text-gray-500 text-sm">Tomorrow at 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-xl">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-gray-800 font-medium">AI Assistant Query</p>
                <p className="text-gray-500 text-sm">Yesterday</p>
              </div>
            </div>
          </div>
        </div>

        {/* Health Tip */}
        <div className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <Heart className="w-8 h-8 flex-shrink-0" fill="white" />
            <div>
              <h3 className="text-xl font-bold mb-2">💡 Health Tip of the Day</h3>
              <p className="text-emerald-50">
                Drink at least 8 glasses of water daily to keep your body hydrated and support kidney function. 
                Stay healthy! 🌟
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// REUSABLE CARD COMPONENT (If needed separately)
// src/components/Card.jsx
// ==========================================

export function Card({ title, desc, icon: Icon, onClick, color = "from-emerald-500 to-teal-600", bgColor = "bg-emerald-50", iconColor = "text-emerald-600" }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:scale-105"
    >
      <div className={`${bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{desc}</p>
      <div className={`inline-flex items-center text-sm font-semibold bg-gradient-to-r ${color} bg-clip-text text-transparent group-hover:gap-2 transition-all`}>
        Get Started
        <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </div>
  );
}