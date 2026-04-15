import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  LayoutDashboard, BookOpen, Building2, MapPin, Tag,
  Search, Edit3, Trash2, Plus, LogOut, TrendingUp,
  Eye, Lightbulb, ChevronDown, X, AlertCircle, CheckCircle
} from "lucide-react";

const ADMIN_PASSWORD = "SeuADMINGOATupdates!@26";

type Resource = {
  id: number;
  resource_name: string;
  description: string;
  location: string;
  department_id: number | null;
  view_count: number;
  keywords: string;
};

type Stats = {
  totalResources: number;
  totalViews: number;
  totalSuggestions: number;
};

type Department = { id: number; name: string };
type Toast = { msg: string; type: "success" | "error" } | null;

export default function AdminSelect() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [toast, setToast] = useState<Toast>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) navigate("/admin-login");
  }, []);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/resources").then((r) => r.json()),
      fetch("/api/auth/stats").then((r) => r.json()),
      fetch("/api/departments").then((r) => r.json()),
    ])
      .then(([res, s, depts]) => {
        setResources(res);
        setStats(s);
        setDepartments(depts);
      })
      .catch(() => showToast("Failed to load dashboard data.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": ADMIN_PASSWORD },
      });
      if (res.ok) {
        showToast(`"${name}" deleted successfully.`, "success");
        setResources((prev) => prev.filter((r) => r.id !== id));
        setStats((prev) => prev ? { ...prev, totalResources: prev.totalResources - 1 } : prev);
      } else {
        showToast("Delete failed. Check your connection.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin-login");
  };

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchSearch =
        search === "" ||
        r.resource_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase()) ||
        r.keywords?.toLowerCase().includes(search.toLowerCase()) ||
        r.location?.toLowerCase().includes(search.toLowerCase());
      const matchDept =
        deptFilter === "all" ||
        (deptFilter === "none" ? !r.department_id : String(r.department_id) === deptFilter);
      return matchSearch && matchDept;
    });
  }, [resources, search, deptFilter]);

  const deptName = (id: number | null) =>
    departments.find((d) => d.id === id)?.name ?? <span className="text-gray-300 italic">Unassigned</span>;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F2E6A] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-[#EDB920] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold tracking-widest uppercase text-sm">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white font-semibold transition-all ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Top Nav */}
      <header className="bg-[#0F2E6A] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Resources", value: stats.totalResources, icon: <BookOpen size={20} />, color: "text-blue-600" },
              { label: "Total Views", value: stats.totalViews?.toLocaleString(), icon: <Eye size={20} />, color: "text-green-600" },
              { label: "Pending Suggestions", value: stats.totalSuggestions, icon: <Lightbulb size={20} />, color: "text-yellow-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-gray-50 ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-2xl font-black text-gray-800">{s.value ?? 0}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: "/admin/departments", icon: <Building2 size={20} />, label: "Departments", count: departments.length },
            { to: "/admin/locations", icon: <MapPin size={20} />, label: "Locations", count: null },
            { to: "/admin/tags", icon: <Tag size={20} />, label: "Tags / Keywords", count: null },
            { to: "/suggest", icon: <Lightbulb size={20} />, label: "View Suggestions", count: stats?.totalSuggestions ?? 0 },
          ].map((nav) => (
            <Link
              key={nav.to}
              to={nav.to}
              className="bg-white border border-gray-200 hover:border-[#EDB920] hover:shadow-md rounded-xl p-4 flex items-center gap-3 transition-all group"
            >
              <span className="text-[#0F2E6A] group-hover:text-[#EDB920] transition-colors">{nav.icon}</span>
              <div>
                <p className="font-bold text-sm text-gray-800">{nav.label}</p>
                {nav.count !== null && (
                  <p className="text-xs text-gray-400">{nav.count} entries</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Resource Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <h2 className="font-black text-gray-800 text-lg">All Resources ({filtered.length})</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:border-[#EDB920] focus:ring-1 focus:ring-[#EDB920]"
                  placeholder="Search name, keywords, location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              {/* Dept Filter */}
              <div className="relative">
                <select
                  className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#EDB920] cursor-pointer"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  <option value="none">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d.id} value={String(d.id)}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">Resource</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs hidden md:table-cell">Department</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs hidden lg:table-cell">Location</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs text-center">Views</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                      <Search size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="font-semibold">No resources match your search.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-bold text-[#0F2E6A] group-hover:text-blue-700 transition-colors leading-tight">
                          {r.resource_name}
                        </p>
                        {r.keywords && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{r.keywords}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm text-gray-600">{deptName(r.department_id)}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-500">{r.location || <span className="text-gray-300 italic">—</span>}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-gray-500 text-xs font-semibold">
                          <TrendingUp size={12} className="text-green-400" />
                          {r.view_count ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/edit/${r.id}`}
                            className="inline-flex items-center gap-1 bg-blue-50 hover:bg-[#0F2E6A] hover:text-white text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          >
                            <Edit3 size={13} /> Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(r.id, r.resource_name)}
                            disabled={deletingId === r.id}
                            className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-600 hover:text-white text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                          >
                            <Trash2 size={13} /> {deletingId === r.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 font-medium">
              Showing {filtered.length} of {resources.length} resources
            </div>
          )}
        </div>
      </div>
    </div>
  );
}