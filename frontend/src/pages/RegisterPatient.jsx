// src/pages/RegisterPatient.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPatient = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add registration logic
    console.log("Patient registered:", name, email);
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register as Patient</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded font-semibold hover:bg-green-600 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPatient;
