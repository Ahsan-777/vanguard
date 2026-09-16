import React from "react";
import { Navigate } from "react-router-dom";
// 1. Define Props interface for component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}
function ProtectedRoute({
  children,
  allowedRoles,
}:ProtectedRouteProps): React.JSX.Element {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole")?.toLowerCase();
if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user's role is permitted
  if (
    allowedRoles &&
    userRole &&
    !allowedRoles.map((r) => r.toLowerCase()).includes(userRole)
  ) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
export default ProtectedRoute;