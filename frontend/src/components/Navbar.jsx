import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Bell, LogOut, Menu, X, Heart } from "lucide-react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar({ userType }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Loading...");
  const [userEmail, setUserEmail] = useState("");

  const navigate = useNavigate();

  // 🔥 Fetch user from Firebase + Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);

        try {
          // 🔥 Fetch role from localStorage
          const role = localStorage.getItem("role") || userType;

          const collectionName =
            role === "doctor" ? "doctors" : "patients";

          const docRef = doc(db, collectionName, user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserName(docSnap.data().name);
          } else {
            setUserName("User");
          }
        } catch (err) {
          console.error("Error fetching user:", err);
          setUserName("User");
        }
      } else {
        setUserName("User");
        setUserEmail("");
      }
    });

    return () => unsubscribe();
  }, [userType]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("role"); // 🔥 cleanup
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const dashboardPath =
    userType === "patient"
      ? "/patient/dashboard"
      : "/doctor/dashboard";

  const initial = userName?.charAt(0)?.toUpperCase();

  return (
    <>
      <nav className="bg-white border-b border-gray-200 fixed top-0 w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-emerald-500 p-2 rounded-xl group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold text-gray-800">
                HealthBridge
              </span>
            </Link>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-5">
              <Link
                to={dashboardPath}
                className="px-4 py-2 text-gray-700 hover:text-emerald-600 font-medium transition"
              >
                Dashboard
              </Link>

              <button className="relative p-2 text-gray-600 hover:text-emerald-600">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  <div className="w-8 h-8 bg-emerald-500 text-white flex items-center justify-center rounded-full font-semibold">
                    {initial}
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userEmail}
                    </p>
                  </div>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                    <Link
                      to={`/${userType}/profile`}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      My Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="px-4 py-2">
                <p className="font-semibold">{userName}</p>
                <p className="text-sm text-gray-500">{userEmail}</p>
              </div>

              <Link
                to={dashboardPath}
                className="block px-4 py-2 hover:bg-gray-50"
              >
                Dashboard
              </Link>

              <Link
                to={`/${userType}/profile`}
                className="block px-4 py-2 hover:bg-gray-50"
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="h-16"></div>
    </>
  );
}