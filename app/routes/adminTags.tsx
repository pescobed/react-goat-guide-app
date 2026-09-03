import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin-login");
      return;
    }
    fetchTags();
  }, [navigate]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/tags");
      if (!res.ok) {
        throw new Error("Failed to fetch tags");
      }
      const data = await res.json();
      setTags(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  };

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

  const handleStartEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditingTagName("");
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
      const res = await adminFetch(`/api/tags/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete tag");
      }

      fetchTags();
    } catch (err: any) {
      setError(err.message || "Failed to delete tag");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav title="Manage Tags" />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Add Tag Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Tag</h2>
          <form onSubmit={handleAddTag} className="flex gap-4">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag Name"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Add Tag
            </button>
          </form>
        </div>

        {/* Tag List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Existing Tags</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-slate-500">Loading tags...</div>
          ) : tags.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No tags found.</div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {tags.map((tag) => (
                <li key={tag.id} className="p-4 flex items-center justify-between">
                  {editingTagId === tag.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <input
                        type="text"
                        value={editingTagName}
                        onChange={(e) => setEditingTagName(e.target.value)}
                        className="flex-1 px-3 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleSaveEdit(tag.id)}
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
                      <span className="font-medium text-slate-700">{tag.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(tag)}
                          className="px-3 py-1 border border-slate-300 text-slate-600 rounded-md text-sm hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
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