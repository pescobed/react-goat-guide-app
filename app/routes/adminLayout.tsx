import { Outlet, Navigate } from "react-router";

export default function AdminLayout() {
  const isAdmin = true; 

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex">
      <nav className="w-64 bg-gray-800 text-white min-h-screen p-4">
        <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
        {/* Admin Links */}
      </nav>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}