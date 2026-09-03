import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Toast } from "../components/Toast";
import { SkeletonLoader } from "../components/SkeletonLoader";

interface Resource {
  id: number;
  resource_name?: string;
  department_id?: number | null;
  department_name?: string | null;
  [key: string]: any;
}

interface Department {
  id: number;
  name: string;
  description?: string;
}

export default AdminDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Action states
  const [newDepartmentName, setNewDepartmentName] = useState<string>("");
  const [newDepartmentDesc, setNewDepartmentDesc] = useState<string>("");
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const adminFetch = (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("admin_token");
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers || {}),
      },
    });
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const [deptRes, resourceRes] = await Promise.all([
        fetch("/api/departments", { headers }),
        fetch("/api/resources", { headers }),
      ]);

      if (!deptRes.ok) {
        throw new Error(`Departments request failed with status ${deptRes.status}`);
      }

      const rawDepts = await deptRes.json();
      const rawResources = resourceRes.ok ? await resourceRes.json() : [];

      setDepartments(Array.isArray(rawDepts) ? rawDepts : rawDepts?.data || []);
      setAllResources(Array.isArray(rawResources) ? rawResources : rawResources?.data || []);
    } catch (err: any) {
      console.error("Fetch Departments Error:", err);
      setError(err.message || "Unable to load department data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await adminFetch("/api/departments", {
        method: "POST",
        body: JSON.stringify({
          name: newDepartmentName.trim(),
          description: newDepartmentDesc.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create department.");

      showToast("Department created successfully!", "success");
      setNewDepartmentName("");
      setNewDepartmentDesc("");
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Error creating department", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept || !editingDept.name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await adminFetch(`/api/departments/${editingDept.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editingDept.name.trim(),
          description: editingDept.description?.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to update department.");

      showToast("Department updated successfully!", "success");
      setEditingDept(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Error updating department", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete department "${name}"?`)) {
      return;
    }

    try {
      const res = await adminFetch(`/api/departments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete department.");

      showToast("Department deleted successfully!", "success");
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Error deleting department", "error");
    }
  };

  // Helper to count linked resources per department[cite: 14]
  const getResourceCountForDepartment = (deptId: number, deptName: string) => {
    return allResources.filter(
      (r) => r.department_id === deptId || r.department_name === deptName
    ).length;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Departments</h1>
          <p className="text-sm text-gray-600">
            View, add, edit, or delete department categories for resources.
          </p>
        </div>
        <Link
          to="/admin"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Create Department Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Add New Department</h2>
        <form onSubmit={handleCreateDepartment} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Department Name *"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Description (Optional)"
            value={newDepartmentDesc}
            onChange={(e) => setNewDepartmentDesc(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newDepartmentName.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Add Department"}
          </button>
        </form>
      </div>

      {/* Departments Table */}
      {loading ? (
        <SkeletonLoader rows={5} />
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connected Resources
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No departments found.
                  </td>
                </tr>
              ) : (
                departments.map((dept) => {
                  const resourceCount = getResourceCountForDepartment(dept.id, dept.name);
                  return (
                    <tr key={dept.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dept.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dept.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {dept.description || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {resourceCount} resource{resourceCount !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => setEditingDept(dept)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingDept && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4">Edit Department</h3>
            <form onSubmit={handleUpdateDepartment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingDept.name}
                  onChange={(e) =>
                    setEditingDept({ ...editingDept, name: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editingDept.description || ""}
                  onChange={(e) =>
                    setEditingDept({ ...editingDept, description: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};