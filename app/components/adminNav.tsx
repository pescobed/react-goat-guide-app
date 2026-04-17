import { Link, useNavigate, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  Tag, 
  Lightbulb, 
  LogOut,
  Plus,
  AlertTriangle
} from "lucide-react";

export default function adminNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin-login");
  };

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/departments", icon: Building2, label: "Departments" },
    { to: "/admin/locations", icon: MapPin, label: "Locations" },
    { to: "/admin/tags", icon: Tag, label: "Tags" },
    { to: "/admin/suggestions", icon: Lightbulb, label: "Suggestions" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-[#0F2E6A] text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-[#EDB920]" size={24} />
            <div>
              <h1 className="text-xl font-black leading-tight">GOAT Guide Admin</h1>
              <p className="text-blue-300 text-xs uppercase tracking-widest">Resource Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/edit/add-resource"
              className="bg-[#EDB920] text-[#0F2E6A] px-4 py-2 rounded-lg font-black text-sm uppercase tracking-wide flex items-center gap-2 hover:bg-yellow-400 transition-colors"
            >
              <Plus size={16} /> Add Resource
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-blue-300 hover:text-white text-sm font-semibold transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                isActive(item.to)
                  ? "bg-[#EDB920] text-[#0F2E6A]"
                  : "bg-blue-900/30 text-blue-200 hover:bg-blue-900/50 hover:text-white"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}