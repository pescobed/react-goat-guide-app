import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Tag as TagIcon, Plus, Pencil, Trash2, Check, X, AlertCircle } from "lucide-react";
import AdminNav from "../components/adminNav";
import { adminFetch } from "../utils/api";

interface Tag {
  id: number;
  name: string;
}

export default function AdminTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/tags");
      if (!res.ok) throw new Error("Failed to fetch tags");
      const data = await res.json();
      setTags(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      const res = await adminFetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add tag");
      }

      setNewTagName("");
      fetchTags();
    } catch (err: any) {
      setError(err.message || "Failed to add tag");
    }
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingTagName.trim()) return;

    try {
      const res = await adminFetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingTagName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update tag");
      }

      setEditingTagId(null);
      setEditingTagName("");
      fetchTags();
    } catch (err: any) {
      setError(err.message || "Failed to update tag");
    }
  };

  const handleDeleteTag = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) return;

    try {
      const res = await adminFetch(`/api/tags/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete tag");
      }

      fetchTags();
    } catch (err: any) {
      setError(err.message || "Failed to delete tag");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#EDB920] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#0F2E6A] font-bold">Loading tags...</p>
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
            <TagIcon className="text-[#EDB920]" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0F2E6A]">Manage Tags</h1>
            <p className="text-sm text-gray-500">{tags.length} total tags</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Add Tag Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Tag</h2>
          <form onSubmit={handleAddTag} className="flex gap-3">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="e.g. Tutoring, STEM, Financial Aid"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EDB920] focus:ring-2 focus:ring-yellow-100 transition-all"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#0F2E6A] hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus size={18} /> Add Tag
            </button>
          </form>
        </div>

        {/* Tag List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-lg">Existing Tags</h2>
          </div>

          {tags.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No tags found.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {tags.map((tag) => (
                <li key={tag.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  {editingTagId === tag.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <input
                        type="text"
                        value={editingTagName}
                        onChange={(e) => setEditingTagName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-[#EDB920] rounded-lg text-sm font-bold text-[#0F2E6A] focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(tag.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => setEditingTagId(null)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-[#0F2E6A] text-base">{tag.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingTagId(tag.id);
                            setEditingTagName(tag.name);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
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