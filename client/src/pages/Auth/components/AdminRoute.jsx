import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = ({ children }) => {
  const { user, status } = useSelector((state) => state.auth);
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Check if logged in and has admin role
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Assuming role exists on user. If it's not set or not 'admin', redirect.
  // We'll also allow access if there's no role validation yet for development purposes,
  // but strictly, it should be: if (user.role !== 'admin')
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
