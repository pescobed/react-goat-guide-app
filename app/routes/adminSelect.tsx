import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  BookOpen, Search, Edit3, Trash2, Eye, TrendingUp,
  ChevronDown, X, AlertCircle, CheckCircle, AlertTriangle,
  Plus, LayoutGrid, Building2, MapPin, Tag, Lightbulb
} from "lucide-react";
import AdminNav from "../components/adminNav";

type Resource = {
  id: number;
  resource_name: string;
  description: string;
  location: string;
  department_id: number | null;
  view_count: number;
  keywords: string;
  phone: string;
  email: string;
  cta_link: string;
  hours: string;
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
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) navigate("/admin-login");
  }, []);

  const fetchAll = () => {
      setLoading(true);
      const token = localStorage.getItem("admin_token");

      Promise.all([
        fetch("/api/auth/all", {
          headers: { "Authorization": `Bearer ${token}` }
        }).then((r) => r.json()),
        fetch("/api/auth/stats", {
          headers: { "Authorization": `Bearer ${token}` }
        }).then((r) => r.json()),
        fetch("/api/departments", {
          headers: { "Authorization": `Bearer ${token}` }
        }).then((r) => r.json()),
      ])
      .then(([res, s, depts]) => {
        setResources(Array.isArray(res) ? res : []);
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

  const token = localStorage.getItem("admin_token");
  
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
        headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
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

  // Check if resource is complete (ready for publishing)
  // Required fields: resource_name, keywords (tags), description
  const isResourceComplete = (r: Resource): boolean => {
    return !!(
      r.resource_name?.trim() &&
      r.description?.trim() &&
      r.keywords?.trim()
    );
  };

  const incompleteResources = useMemo(() => {
    return resources.filter(r => !isResourceComplete(r));
  }, [resources]);

  const filtered = useMemo(() => {
    let filtered = resources;

    // Filter by incomplete status
    if (showIncompleteOnly) {
      filtered = filtered.filter(r => !isResourceComplete(r));
    }

    // Filter by search
    if (search) {
      filtered = filtered.filter((r) => {
        const searchLower = search.toLowerCase();
        return (
          r.resource_name?.toLowerCase().includes(searchLower) ||
          r.description?.toLowerCase().includes(searchLower) ||
          r.keywords?.toLowerCase().includes(searchLower) ||
          r.location?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filter by department
    if (deptFilter !== "all") {
      filtered = filtered.filter(r => 
        deptFilter === "none" ? !r.department_id : String(r.department_id) === deptFilter
      );
    }

    return filtered;
  }, [resources, search, deptFilter, showIncompleteOnly]);

  const deptName = (id: number | null) =>
    departments.find((d) => d.id === id)?.name ?? <span className="text-gray-300 italic">Unassigned</span>;

  const getMissingFields = (r: Resource): string[] => {
    const missing: string[] = [];
    if (!r.resource_name?.trim()) missing.push("Name");
    if (!r.description?.trim()) missing.push("Description");
    if (!r.keywords?.trim()) missing.push("Tags");
    return missing;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#EDB920] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#0F2E6A] font-bold">Loading Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      <AdminNav />

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Resources</p>
                <p className="text-3xl font-black text-[#0F2E6A]">{stats?.totalResources ?? 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <BookOpen className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Views</p>
                <p className="text-3xl font-black text-[#0F2E6A]">{stats?.totalViews ?? 0}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <Eye className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Suggestions</p>
                <p className="text-3xl font-black text-[#0F2E6A]">{stats?.totalSuggestions ?? 0}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl">
                <AlertCircle className="text-[#EDB920]" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Incomplete Resources</p>
                <p className="text-3xl font-black text-red-600">{incompleteResources.length}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Incomplete Resources Alert */}
        {incompleteResources.length > 0 && !showIncompleteOnly && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-4 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div className="flex-1">
              <p className="font-black text-red-800 text-lg mb-1">
                {incompleteResources.length} Resource{incompleteResources.length !== 1 ? "s" : ""} Need Attention
              </p>
              <p className="text-sm text-red-700 mb-3">
                These resources are missing required fields (Name, Description, or Tags) and cannot be published to the main site.
              </p>
              <button
                onClick={() => setShowIncompleteOnly(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
              >
                View Incomplete Resources
              </button>
            </div>
          </div>
        )}

        {/* Resource Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
              <h2 className="font-black text-gray-800 text-xl flex items-center gap-2">
                <LayoutGrid size={24} className="text-[#EDB920]" />
                {showIncompleteOnly ? `Incomplete Resources (${filtered.length})` : `All Resources (${filtered.length})`}
              </h2>
              {showIncompleteOnly && (
                <button
                  onClick={() => setShowIncompleteOnly(false)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  <X size={16} /> Show All Resources
                </button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#EDB920] focus:ring-2 focus:ring-yellow-100 transition-all"
                  placeholder="Search name, keywords, location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button 
                    onClick={() => setSearch("")} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#EDB920] cursor-pointer w-full sm:w-auto"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  <option value="none">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d.id} value={String(d.id)}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
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
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs text-center">Status</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs text-center">Views</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                      <Search size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="font-semibold">No resources match your search.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const isComplete = isResourceComplete(r);
                    const missingFields = getMissingFields(r);

                    return (
                      <tr key={r.id} className={`hover:bg-gray-50 transition-colors group ${!isComplete ? 'bg-red-50/30' : ''}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2">
                            {!isComplete && (
                              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                            )}
                            <div>
                              <p className="font-bold text-[#0F2E6A] group-hover:text-blue-700 transition-colors leading-tight">
                                {r.resource_name || <span className="text-gray-400 italic">Untitled</span>}
                              </p>
                              {r.keywords && (
                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{r.keywords}</p>
                              )}
                              {!isComplete && (
                                <p className="text-xs text-red-600 font-semibold mt-1">
                                  Missing: {missingFields.join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="text-sm text-gray-600">{deptName(r.department_id)}</span>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className="text-sm text-gray-500">{r.location || <span className="text-gray-300 italic">—</span>}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {isComplete ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                              <CheckCircle size={12} /> Complete
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                              <AlertTriangle size={12} /> Incomplete
                            </span>
                          )}
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
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit3 size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(r.id, r.resource_name)}
                              disabled={deletingId === r.id}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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