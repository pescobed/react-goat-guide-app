import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Building2, Plus, Pencil, Trash2, Check, X, AlertCircle } from "lucide-react";
import AdminNav from "../components/adminNav";
import { adminFetch } from "../utils/api";

interface Department {
  id: number;
  name: string;
}

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null);
  const [editingDepartmentName, setEditingDepartmentName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/departments");
      if (!res.ok) throw new Error("Failed to fetch departments");
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) return;

    try {
      const res = await adminFetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDepartmentName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add department");
      }

      setNewDepartmentName("");
      fetchDepartments();
    } catch (err: any) {
      setError(err.message || "Failed to add department");
    }
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingDepartmentName.trim()) return;

    try {
      const res = await adminFetch(`/api/departments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingDepartmentName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update department");
      }

      setEditingDepartmentId(null);
      setEditingDepartmentName("");
      fetchDepartments();
    } catch (err: any) {
      setError(err.message || "Failed to update department");
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      const res = await adminFetch(`/api/departments/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete department");
      }

      fetchDepartments();
    } catch (err: any) {
      setError(err.message || "Failed to delete department");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#EDB920] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#0F2E6A] font-bold">Loading departments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#0F2E6A] rounded-xl shadow-sm">
            <Building2 className="text-[#EDB920]" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0F2E6A]">Manage Departments</h1>
            <p className="text-sm text-gray-500">{departments.length} total departments</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Add Department Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Department</h2>
          <form onSubmit={handleAddDepartment} className="flex gap-3">
            <input
              type="text"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              placeholder="e.g. Department of Computer Science"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EDB920] focus:ring-2 focus:ring-yellow-100 transition-all"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#0F2E6A] hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus size={18} /> Add Department
            </button>
          </form>
        </div>

        {/* Department List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-lg">Existing Departments</h2>
          </div>

          {departments.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No departments found.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {departments.map((dept) => (
                <li key={dept.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  {editingDepartmentId === dept.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <input
                        type="text"
                        value={editingDepartmentName}
                        onChange={(e) => setEditingDepartmentName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-[#EDB920] rounded-lg text-sm font-bold text-[#0F2E6A] focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(dept.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => setEditingDepartmentId(null)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-[#0F2E6A] text-base">{dept.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingDepartmentId(dept.id);
                            setEditingDepartmentName(dept.name);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}