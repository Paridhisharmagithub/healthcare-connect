import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const storedRole = localStorage.getItem("role");
  if (role && storedRole && storedRole !== role) {
    return <Navigate to={`/${storedRole}/dashboard`} replace />;
  }

  return children;
}
