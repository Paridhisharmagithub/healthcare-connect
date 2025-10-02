// src/pages/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 text-white">
      <h1 className="text-5xl font-bold mb-6">Welcome to Healthcare Connect</h1>
      <p className="text-lg mb-8">Your health, your way – connecting patients, doctors, and hospitals.</p>
      <div className="flex gap-4">
        <Link to="/login" className="bg-white text-blue-500 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition">
          Login
        </Link>
        <Link to="/register-patient" className="bg-white text-blue-500 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition">
          Register as Patient
        </Link>
        <Link to="/register-doctor" className="bg-white text-blue-500 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition">
          Register as Doctor
        </Link>
      </div>
    </div>
  );
};

export default Landing;
