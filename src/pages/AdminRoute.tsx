import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const parsedUser = JSON.parse(user);

  if (parsedUser.role !== "admin") {
    return <Navigate to="/" replace />; // ❌ user side blocked
  }

  return children;
};

export default AdminRoute;
