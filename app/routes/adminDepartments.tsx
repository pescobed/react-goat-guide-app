import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import {
  Building2, Plus, Trash2, Pencil, Check, X,
  AlertCircle, CheckCircle, Search, ChevronDown, 
  BookOpen, ExternalLink
} from "lucide-react";
import AdminNav from "../components/adminNav";

type Department = { id: number; name: string; resource_count: number };
type Resource = { id: number; resource_name: string; department_id: number | null };
type Toast = { msg: string; type: "success" | "error" } | null;

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedDept, setExpandedDept] = useState<number | null>(null);
  
  // States for adding/editing
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const [deptRes, resourceRes] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/resources")
      ]);
      
      const depts = await deptRes.json();
      const resources = await resourceRes.json();
      
      setDepartments(depts);
      setAllResources(resources);
    } catch (err) {
      showToast("Failed to load data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter departments based on search
  const filteredDepartments = useMemo(() => {
    return departments.filter(d => 
      d.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [departments, search]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        showToast("Department created!", "success");
        setNewName("");
        setShowAdd(false);
        fetchData();
      }
    } catch {
      showToast("Error creating department.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async (id: number) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/departments/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        showToast("Updated successfully", "success");
        setEditingId(null);
        fetchData();
      }
    } catch {
      showToast("Update failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (dept: Department) => {
    if (dept.resource_count > 0) {
      showToast("Cannot delete: Department has linked resources.", "error");
      return;
    }
    if (!confirm(`Delete ${dept.name}?`)) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/departments/${dept.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Department removed", "success");
        fetchData();
      }
    } catch {
      showToast("Delete failed.", "error");
    }
  };

  if (loading) return <div className="text-center py-20">Loading Departments...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white font-bold transition-all ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-3xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0F2E6A] rounded-xl">
              <Building2 className="text-[#EDB920]" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0F2E6A]">Departments</h1>
              <p className="text-sm text-gray-500">{departments.length} total categories</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center justify-center gap-2 bg-[#0F2E6A] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all"
          >
            {showAdd ? <X size={18} /> : <Plus size={18} />}
            {showAdd ? "Cancel" : "Add New"}
          </button>
        </div>

        {/* Add New Input */}
        {showAdd && (
          <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-gray-200 mb-6 flex gap-3">
            <input 
              className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:border-[#EDB920]"
              placeholder="Enter department name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <button 
              onClick={handleAdd}
              disabled={isProcessing || !newName.trim()}
              className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50"
            >
              Save
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:border-[#EDB920]"
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Department List */}
        <div className="space-y-3">
          {filteredDepartments.map((dept) => {
            const isExpanded = expandedDept === dept.id;
            const linkedResources = allResources.filter(r => r.department_id === dept.id);

            return (
              <div key={dept.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button 
                      onClick={() => setExpandedDept(isExpanded ? null : dept.id)}
                      className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <ChevronDown size={20} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {editingId === dept.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          className="flex-1 px-3 py-1 border-b-2 border-[#EDB920] focus:outline-none font-bold text-[#0F2E6A]"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                        <button onClick={() => handleUpdate(dept.id)} className="text-green-600"><Check size={20} /></button>
                        <button onClick={() => setEditingId(null)} className="text-red-600"><X size={20} /></button>
                      </div>
                    ) : (
                      <div onClick={() => setExpandedDept(isExpanded ? null : dept.id)} className="cursor-pointer">
                        <p className="font-bold text-[#0F2E6A]">{dept.name}</p>
                        <p className="text-xs text-gray-400">{dept.resource_count} linked resource{dept.resource_count !== 1 ? 's' : ''}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setEditingId(dept.id); setEditName(dept.name); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(dept)}
                      className={`p-2 rounded-lg transition-colors ${dept.resource_count > 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                      disabled={dept.resource_count > 0}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Expanded Section (Accordion) */}
                {isExpanded && (
                  <div className="bg-gray-50/50 border-t border-gray-100 px-12 py-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Resources in this department</p>
                    <div className="space-y-2">
                      {linkedResources.length === 0 ? (
                        <p className="text-xs italic text-gray-400">No resources assigned to this department.</p>
                      ) : (
                        linkedResources.map(res => (
                          <div key={res.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-sm font-bold text-gray-700">{res.resource_name}</span>
                            <Link 
                              to={`/admin/edit/${res.id}`}
                              className="text-xs font-black text-blue-600 hover:underline"
                            >
                              EDIT
                            </Link>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}