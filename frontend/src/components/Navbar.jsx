// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Bell, LogOut, Menu, X, Heart } from "lucide-react";
import { signOut } from "firebase/auth"; // Import from firebase/auth
import { auth } from "../firebase";       // Your auth instance

export default function Navbar({ userType, userName = "User" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const dashboardPath = userType === "patient" ? "/patient/dashboard" : "/doctor/dashboard";

  return (
    <>
      <nav className="bg-white border-b border-gray-200 fixed top-0 w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={dashboardPath} className="flex items-center gap-2 group">
              <div className="bg-emerald-500 p-2 rounded-xl group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold text-gray-800">
                HealthBridge
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to={dashboardPath}
                className="px-4 py-2 text-gray-700 hover:text-emerald-600 font-medium transition"
              >
                Dashboard
              </Link>

              <button className="relative p-2 text-gray-600 hover:text-emerald-600 transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  <User className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-700 font-medium">{userName}</span>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                    <Link
                      to={`/${userType}/profile`}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <Link
                to={dashboardPath}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
              >
                Dashboard
              </Link>
              <Link
                to={`/${userType}/profile`}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer so content starts below navbar */}
      <div className="h-16"></div>
    </>
  );
}
