// src/pages/RegisterPatient.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase"; // path check karo
import { doc, setDoc } from "firebase/firestore";

const RegisterPatient = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "patients", user.uid), {
        name,
        email,
        createdAt: new Date()
      });

      console.log("Patient registered:", name, email);
      navigate("/patient/dashboard"); // ✅ redirect to dashboard
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please login instead.");
      } else {
        alert(error.message);
      }
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register as Patient</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

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
