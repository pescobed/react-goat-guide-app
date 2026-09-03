import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin-login");
      return;
    }
    fetchDepartments();
  }, [navigate]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/departments");
      if (!res.ok) {
        throw new Error("Failed to fetch departments");
      }
      const data = await res.json();
      setDepartments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

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

  const handleStartEdit = (department: Department) => {
    setEditingDepartmentId(department.id);
    setEditingDepartmentName(department.name);
  };

  const handleCancelEdit = () => {
    setEditingDepartmentId(null);
    setEditingDepartmentName("");
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
      const res = await adminFetch(`/api/departments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete department");
      }

      fetchDepartments();
    } catch (err: any) {
      setError(err.message || "Failed to delete department");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav title="Manage Departments" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Add Department Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Department</h2>
          <form onSubmit={handleAddDepartment} className="flex gap-4">
            <input
              type="text"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              placeholder="Department Name"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Add Department
            </button>
          </form>
        </div>

        {/* Department List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Existing Departments</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-slate-500">Loading departments...</div>
          ) : departments.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No departments found.</div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {departments.map((dept) => (
                <li key={dept.id} className="p-4 flex items-center justify-between">
                  {editingDepartmentId === dept.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <input
                        type="text"
                        value={editingDepartmentName}
                        onChange={(e) => setEditingDepartmentName(e.target.value)}
                        className="flex-1 px-3 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleSaveEdit(dept.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-slate-200 text-slate-700 rounded-md text-sm hover:bg-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-slate-700">{dept.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(dept)}
                          className="px-3 py-1 border border-slate-300 text-slate-600 rounded-md text-sm hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="px-3 py-1 border border-red-200 text-red-600 rounded-md text-sm hover:bg-red-50"
                        >
                          Delete
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