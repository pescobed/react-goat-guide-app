import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ChevronLeft, Building2, Plus, Trash2, Pencil, Check, X, AlertCircle, CheckCircle } from "lucide-react";

const ADMIN_PASSWORD = "SeuADMINGOATupdates!@26";

type Department = { id: number; name: string; resource_count: number };
type Toast = { msg: string; type: "success" | "error" } | null;

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDept, setNewDept] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [toast, setToast] = useState<Toast>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDepts = () => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => { setDepartments(data); setLoading(false); })
      .catch(() => { showToast("Failed to load departments.", "error"); setLoading(false); });
  };

  useEffect(() => { fetchDepts(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": ADMIN_PASSWORD,
        },
        body: JSON.stringify({ name: newDept.trim() }),
      });
      if (res.ok) {
        setNewDept("");
        showToast("Department added successfully.", "success");
        fetchDepts();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to add department.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRename = async (id: number) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": ADMIN_PASSWORD,
        },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        showToast("Department renamed.", "success");
        setEditingId(null);
        fetchDepts();
      } else {
        showToast("Rename failed.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    }
  };

  const handleDelete = async (dept: Department) => {
    if (dept.resource_count > 0) {
      showToast(`Cannot delete: ${dept.resource_count} resource(s) are still assigned to "${dept.name}". Reassign them first.`, "error");
      return;
    }
    if (!confirm(`Delete department "${dept.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/departments/${dept.id}`, {
        method: "DELETE",
        headers: { "x-admin-password": ADMIN_PASSWORD },
      });
      if (res.ok) {
        showToast(`"${dept.name}" deleted.`, "success");
        setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
      } else {
        const err = await res.json();
        showToast(err.error || "Delete failed.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white font-semibold max-w-sm ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Back Nav */}
        <Link
          to="/admin"
          className="inline-flex items-center text-gray-500 hover:text-[#0F2E6A] mb-6 font-semibold text-sm transition-colors"
        >
          <ChevronLeft size={18} /> Back to Dashboard
        </Link>

        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-[#0F2E6A] rounded-xl">
            <Building2 className="text-[#EDB920]" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0F2E6A]">Departments</h1>
            <p className="text-sm text-gray-500">{departments.length} departments configured</p>
          </div>
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Plus size={16} className="text-[#EDB920]" /> Add New Department
          </h2>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              className="grow p-3 border-2 rounded-xl outline-none focus:border-[#EDB920] text-sm transition-colors"
              placeholder="e.g. Student Affairs, Financial Aid..."
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0F2E6A] hover:bg-blue-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-60 text-sm"
            >
              <Plus size={16} /> {submitting ? "Adding..." : "Add"}
            </button>
          </form>
        </div>

        {/* Department List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading...</div>
          ) : departments.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-200">
              No departments yet. Add one above.
            </div>
          ) : (
            departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-4 grow mr-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-[#0F2E6A]" />
                  </div>

                  {editingId === dept.id ? (
                    <div className="flex items-center gap-2 grow">
                      <input
                        className="grow p-2 border-2 border-[#EDB920] rounded-lg text-sm font-bold outline-none"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(dept.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button
                        onClick={() => handleRename(dept.id)}
                        className="p-2 bg-green-50 hover:bg-green-500 hover:text-white text-green-600 rounded-lg transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 bg-gray-50 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-[#0F2E6A]">{dept.name}</p>
                      <p className="text-xs text-gray-400">
                        {dept.resource_count ?? 0} linked resource{dept.resource_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </div>

                {editingId !== dept.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingId(dept.id); setEditName(dept.name); }}
                      className="p-2 text-gray-400 hover:text-[#0F2E6A] hover:bg-blue-50 rounded-lg transition-colors"
                      title="Rename"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title={dept.resource_count > 0 ? "Cannot delete — resources assigned" : "Delete"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {departments.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-6">
            💡 Departments with linked resources cannot be deleted. Reassign resources first via the main dashboard.
          </p>
        )}
      </div>
    </div>
  );
}