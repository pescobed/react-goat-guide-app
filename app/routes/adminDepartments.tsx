import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import {
  Building2, Plus, Trash2, Pencil, Check, X,
  AlertCircle, CheckCircle, Search, ChevronDown
} from "lucide-react";
import AdminNav from "../components/adminNav";
import { adminFetch } from "../utils/api";

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

  // States for adding resources
  const [addingToDept, setAddingToDept] = useState<number | null>(null);
  const [resourceSearch, setResourceSearch] = useState("");

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const [deptRes, resourceRes] = await Promise.all([
        adminFetch("/api/departments"),
        adminFetch("/api/resources")
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
      const res = await adminFetch("/api/departments", {
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
    if (!editName.trim()) return;
    setIsProcessing(true);
    
    const oldDept = departments.find(d => d.id === id);
    if (!oldDept) return;
    
    try {
      const token = localStorage.getItem("admin_token");
      const res = await adminFetch(`/api/departments/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        showToast("Department name updated!", "success");
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
    if (!confirm(`Delete "${dept.name}"?`)) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await adminFetch(`/api/departments/${dept.id}`, {
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

  const handleRemoveResourceFromDept = async (resourceId: number, resourceName: string) => {
    if (!confirm(`Remove "${resourceName}" from this department?`)) return;
    
    const resource = allResources.find(r => r.id === resourceId);
    if (!resource) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await adminFetch(`/api/resources/${resourceId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...resource,
          department_id: null,
        }),
      });

      if (res.ok) {
        showToast(`Removed "${resourceName}" from department`, "success");
        fetchData();
      }
    } catch {
      showToast("Failed to remove resource.", "error");
    }
  };

  const handleAddResourceToDept = async (resourceId: number, deptId: number) => {
    const resource = allResources.find(r => r.id === resourceId);
    if (!resource) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await adminFetch(`/api/resources/${resourceId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...resource,
          department_id: deptId,
        }),
      });

      if (res.ok) {
        showToast(`Added "${resource.resource_name}" to department`, "success");
        setAddingToDept(null);
        setResourceSearch("");
        fetchData();
      }
    } catch {
      showToast("Failed to add resource.", "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#EDB920] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#0F2E6A] font-bold">Loading Departments...</p>
        </div>
      </div>
    </div>
  );

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
            className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:border-[#EDB920] focus:ring-2 focus:ring-yellow-100"
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Department List */}
        <div className="space-y-3">
          {filteredDepartments.map((dept) => {
            const isExpanded = expandedDept === dept.id;
            const linkedResources = allResources.filter(r => r.department_id === dept.id);
            const availableResources = allResources.filter(r => r.department_id !== dept.id);
            const isAdding = addingToDept === dept.id;

            const filteredAvailable = resourceSearch.trim() 
              ? availableResources.filter(r => 
                  r.resource_name.toLowerCase().includes(resourceSearch.toLowerCase())
                )
              : availableResources;

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
                          autoFocus
                        />
                        <button onClick={() => handleUpdate(dept.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Save">
                          <Check size={20} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Cancel">
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <div onClick={() => setExpandedDept(isExpanded ? null : dept.id)} className="cursor-pointer flex-1">
                        <p className="font-bold text-[#0F2E6A]">{dept.name}</p>
                        <p className="text-xs text-gray-400">{dept.resource_count} linked resource{dept.resource_count !== 1 ? 's' : ''}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setEditingId(dept.id); setEditName(dept.name); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit name"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(dept)}
                      className={`p-2 rounded-lg transition-colors ${dept.resource_count > 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                      disabled={dept.resource_count > 0}
                      title={dept.resource_count > 0 ? "Remove all resources first" : "Delete department"}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Expanded Section (Accordion) */}
                {isExpanded && (
                  <div className="bg-gray-50/50 border-t border-gray-100 px-12 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resources in this department</p>
                      <button
                        onClick={() => setAddingToDept(isAdding ? null : dept.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${isAdding ? 'bg-gray-200 text-gray-600' : 'bg-[#0F2E6A] text-white hover:bg-blue-800'}`}
                      >
                        {isAdding ? <X size={14} /> : <Plus size={14} />}
                        {isAdding ? "Cancel" : "Add Resource"}
                      </button>
                    </div>

                    {/* Add Resource Search */}
                    {isAdding && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="relative mb-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-blue-400"
                            placeholder="Search resources to add..."
                            value={resourceSearch}
                            onChange={(e) => setResourceSearch(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {filteredAvailable.length === 0 ? (
                            <p className="text-xs text-gray-500 italic p-2">No available resources found.</p>
                          ) : (
                            filteredAvailable.slice(0, 10).map(res => (
                              <button
                                key={res.id}
                                onClick={() => handleAddResourceToDept(res.id, dept.id)}
                                className="w-full text-left p-2 hover:bg-blue-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                              >
                                {res.resource_name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {linkedResources.length === 0 ? (
                        <p className="text-xs italic text-gray-400">No resources assigned to this department.</p>
                      ) : (
                        linkedResources.map(res => (
                          <div key={res.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm group">
                            <span className="text-sm font-bold text-gray-700">{res.resource_name}</span>
                            <div className="flex items-center gap-2">
                              <Link 
                                to={`/admin/edit/${res.id}`}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit resource"
                              >
                                <Pencil size={16} />
                              </Link>
                              <button
                                onClick={() => handleRemoveResourceFromDept(res.id, res.resource_name)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove from department"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
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