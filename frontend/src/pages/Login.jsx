// src/pages/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { LogIn, Mail, Lock, ArrowLeft, Heart, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔥 Auto redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Detect role
        let role = "patient";

        const doctorDoc = await getDoc(doc(db, "doctors", user.uid));
        if (doctorDoc.exists()) {
          role = "doctor";
        }

        localStorage.setItem("role", role);
        navigate(`/${role}/dashboard`);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 🔥 Detect role
      let role = "patient";

      const doctorDoc = await getDoc(doc(db, "doctors", user.uid));
      if (doctorDoc.exists()) {
        role = "doctor";
      }

      localStorage.setItem("role", role);

      console.log("Login successful:", email, role);

      navigate(`/${role}/dashboard`);
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden flex items-center justify-center p-4">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-200 rounded-full blur-xl opacity-30 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Back */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg">
              <Heart className="w-10 h-10 text-white" fill="white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-emerald-600 mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600">
            Login to access your healthcare dashboard
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white">
          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-emerald-400"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:border-emerald-400"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Register Links */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => navigate("/register-patient")}
              className="border border-emerald-300 py-2 rounded-xl text-emerald-600"
            >
              Patient
            </button>

            <button
              onClick={() => navigate("/register-doctor")}
              className="border border-teal-300 py-2 rounded-xl text-teal-600"
            >
              Doctor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;