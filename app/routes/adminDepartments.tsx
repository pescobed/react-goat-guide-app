import { useState, useEffect } from "react";
import { Building2, Plus, Trash2, Pencil, Check, X, AlertCircle, CheckCircle, Search as SearchIcon } from "lucide-react";
import AdminNav from "../components/adminNav";

type Department = { id: number; name: string; resource_count: number };
type Toast = { msg: string; type: "success" | "error" } | null;

// Validation helper: Proper title case with exceptions
const validateDepartmentName = (name: string): { valid: boolean; suggestion?: string; error?: string } => {
  const trimmed = name.trim();
  
  if (!trimmed) {
    return { valid: false, error: "Department name cannot be empty" };
  }

  // Words that should be lowercase (unless at the start)
  const lowercaseWords = new Set(["of", "the", "and", "for", "in", "on", "at", "to", "a", "an"]);
  
  // Split into words
  const words = trimmed.split(/\s+/);
  
  // Create properly capitalized version
  const properCase = words.map((word, index) => {
    const lower = word.toLowerCase();
    
    // First word is always capitalized
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    
    // Check if it's a lowercase exception word
    if (lowercaseWords.has(lower)) {
      return lower;
    }
    
    // Check if it's an acronym (all caps, 2-5 letters)
    if (word.length >= 2 && word.length <= 5 && word === word.toUpperCase()) {
      return word; // Keep acronyms as-is
    }
    
    // Otherwise, capitalize first letter
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(" ");
  
  // If input doesn't match proper case, suggest it
  if (trimmed !== properCase) {
    return { 
      valid: true, 
      suggestion: properCase 
    };
  }
  
  return { valid: true };
};

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [newDept, setNewDept] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [toast, setToast] = useState<Toast>(null);
  const [nameValidation, setNameValidation] = useState<ReturnType<typeof validateDepartmentName>>({ valid: true });

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDepts = () => {
    const token = localStorage.getItem("admin_token");
    fetch("/api/departments", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => { 
        setAllDepartments(data);
        setDepartments(data); 
        setLoading(false); 
      })
      .catch(() => { showToast("Failed to load departments.", "error"); setLoading(false); });
  };

  useEffect(() => { fetchDepts(); }, []);

  // Filter departments based on search
  useEffect(() => {
    if (!search.trim()) {
      setDepartments(allDepartments);
    } else {
      const searchLower = search.toLowerCase();
      setDepartments(
        allDepartments.filter(d => 
          d.name.toLowerCase().includes(searchLower)
        )
      );
    }
  }, [search, allDepartments]);

  // Validate as user types
  useEffect(() => {
    if (newDept.trim()) {
      setNameValidation(validateDepartmentName(newDept));
    } else {
      setNameValidation({ valid: true });
    }
  }, [newDept]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.trim()) return;

    const validation = validateDepartmentName(newDept);
    
    // If there's a suggestion, ask user if they want to use it
    if (validation.suggestion) {
      const useSuggestion = confirm(
        `Suggested capitalization:\n\n"${validation.suggestion}"\n\nWould you like to use this instead?`
      );
      if (useSuggestion) {
        setNewDept(validation.suggestion);
        return; // Don't submit yet, let them review
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
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

    const validation = validateDepartmentName(editName);
    const token = localStorage.getItem("admin_token");
    // If there's a suggestion, ask user if they want to use it
    if (validation.suggestion) {
      const useSuggestion = confirm(
        `Suggested capitalization:\n\n"${validation.suggestion}"\n\nWould you like to use this instead?`
      );
      if (useSuggestion) {
        setEditName(validation.suggestion);
        return; // Don't submit yet
      }
    }

    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: "PUT",
         headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
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
  const token = localStorage.getItem("admin_token");
  const handleDelete = async (dept: Department) => {
    if (dept.resource_count > 0) {
      showToast(`Cannot delete: ${dept.resource_count} resource(s) are still assigned to "${dept.name}". Reassign them first.`, "error");
      return;
    }
    if (!confirm(`Delete department "${dept.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/departments/${dept.id}`, {
        method: "DELETE",
         headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
      });
      if (res.ok) {
        showToast(`"${dept.name}" deleted.`, "success");
        setAllDepartments((prev) => prev.filter((d) => d.id !== dept.id));
      } else {
        const err = await res.json();
        showToast(err.error || "Delete failed.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    }
  };

  const applySuggestion = () => {
    if (nameValidation.suggestion) {
      setNewDept(nameValidation.suggestion);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Admin Navigation */}
      <AdminNav />

      <div className="max-w-2xl mx-auto p-6 md:p-8">
        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-[#0F2E6A] rounded-xl">
            <Building2 className="text-[#EDB920]" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0F2E6A]">Departments</h1>
            <p className="text-sm text-gray-500">{allDepartments.length} departments configured</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              className="w-full pl-10 pr-4 py-3 border-2 rounded-lg outline-none focus:border-[#EDB920] text-sm transition-colors"
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {search && (
            <p className="text-xs text-gray-500 mt-2">
              Showing {departments.length} of {allDepartments.length} departments
            </p>
          )}
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Plus size={16} className="text-[#EDB920]" /> Add New Department
          </h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="flex gap-2">
              <div className="grow">
                <input
                  className={`w-full p-3 border-2 rounded-xl outline-none transition-colors text-sm ${
                    nameValidation.suggestion 
                      ? "border-yellow-400 focus:border-yellow-500" 
                      : "focus:border-[#EDB920]"
                  }`}
                  placeholder="e.g. Student Affairs, Office of Information Technology..."
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  required
                />
                {nameValidation.suggestion && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={14} />
                    <div className="text-xs text-yellow-800 flex-1">
                      <p className="font-semibold mb-1">Suggested capitalization:</p>
                      <p className="font-mono bg-yellow-100 px-2 py-1 rounded">{nameValidation.suggestion}</p>
                      <button
                        type="button"
                        onClick={applySuggestion}
                        className="mt-2 text-yellow-700 hover:text-yellow-900 font-bold underline"
                      >
                        Apply suggestion
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#0F2E6A] hover:bg-blue-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-60 text-sm shrink-0"
              >
                <Plus size={16} /> {submitting ? "Adding..." : "Add"}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              💡 Examples: "Campus Ministry", "Office of Information Technology" (not "OIT")
            </p>
          </form>
        </div>

        {/* Department List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading...</div>
          ) : departments.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-200">
              {search ? "No departments match your search." : "No departments yet. Add one above."}
            </div>
          ) : (
            departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-4 grow mr-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
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