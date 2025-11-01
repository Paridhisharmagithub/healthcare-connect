import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Stethoscope, User, Activity, Calendar, MessageCircle, Shield, ArrowRight } from "lucide-react";

const Landing = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 px-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              HealthBridge
            </span>
          </div>
          <Link 
            to="/login" 
            className="text-emerald-700 font-medium hover:text-emerald-800 transition flex items-center gap-2"
          >
            Already registered? Login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-block mb-4 px-4 py-2 bg-emerald-100 rounded-full">
          <span className="text-emerald-700 font-medium text-sm">Connecting Rural India to Quality Healthcare</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
          Your Health Journey,
          <br />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Simplified & Accessible
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Bridging the gap between patients and healthcare providers with smart technology, 
          instant consultations, and AI-powered medical insights.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-16 flex-wrap">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">10K+</div>
            <div className="text-gray-600">Active Patients</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600">500+</div>
            <div className="text-gray-600">Verified Doctors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-600">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Patient Card */}
          <div
            onMouseEnter={() => setHoveredCard('patient')}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-300 cursor-pointer border-2 ${
              hoveredCard === 'patient' 
                ? 'border-emerald-400 shadow-2xl scale-105' 
                : 'border-transparent shadow-lg'
            }`}
          >
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                For Patients
              </div>
            </div>

            {/* Icon */}
            <div className="mt-4 mb-6 flex justify-center">
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-6 rounded-2xl">
                <User className="w-16 h-16 text-emerald-600" />
              </div>
            </div>

            {/* Content */}
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              I'm a Patient
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Get instant access to doctors, analyze your medical reports with AI, 
              and manage your health records securely - all in one place.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-gray-700">AI-powered report analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-gray-700">Video consultations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-cyan-600" />
                </div>
                <span className="text-gray-700">Easy appointment booking</span>
              </div>
            </div>

            {/* CTA Button */}
            <Link
              to="/register-patient"
              className={`block w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 ${
                hoveredCard === 'patient' ? 'shadow-xl' : 'shadow-md'
              } hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 group`}
            >
              Register as Patient
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Doctor Card */}
          <div
            onMouseEnter={() => setHoveredCard('doctor')}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-300 cursor-pointer border-2 ${
              hoveredCard === 'doctor' 
                ? 'border-teal-400 shadow-2xl scale-105' 
                : 'border-transparent shadow-lg'
            }`}
          >
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                For Doctors
              </div>
            </div>

            {/* Icon */}
            <div className="mt-4 mb-6 flex justify-center">
              <div className="bg-gradient-to-br from-teal-100 to-cyan-100 p-6 rounded-2xl">
                <Stethoscope className="w-16 h-16 text-teal-600" />
              </div>
            </div>

            {/* Content */}
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              I'm a Doctor
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Expand your reach to rural areas, conduct online consultations, 
              and help patients understand their medical reports better.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center gap-3">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-gray-700">Flexible scheduling</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-cyan-600" />
                </div>
                <span className="text-gray-700">Verified credentials</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-gray-700">Secure consultations</span>
              </div>
            </div>

            {/* CTA Button */}
            <Link
              to="/register-doctor"
              className={`block w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 ${
                hoveredCard === 'doctor' ? 'shadow-xl' : 'shadow-md'
              } hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 group`}
            >
              Register as Doctor
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Login Link */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Already have an account?
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:text-emerald-800 transition group"
          >
            Login to your account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-16 py-8 border-t border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-600">
            © 2025 HealthBridge. Making healthcare accessible for everyone.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Landing;