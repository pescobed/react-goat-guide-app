import { Outlet, Navigate } from "react-router";
import AdminNav from "../components/adminNav";

export default function AdminLayout() {
  const token = localStorage.getItem("admin_token");

  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <Outlet />
    </div>
  );
}