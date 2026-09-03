import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Toast } from "./Toast";
import { SkeletonLoader } from "./SkeletonLoader";

interface Resource {
  id: number;
  resource_name?: string;
  tags?: string[] | string;
  [key: string]: any;
}

interface Tag {
  id: number;
  name: string;
}

export const AdminTags: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newTagName, setNewTagName] = useState<string>("");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
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
      const [tagsRes, resourceRes] = await Promise.all([
        adminFetch("/api/tags"),
        adminFetch("/api/resources"),
      ]);

      if (!tagsRes.ok || !resourceRes.ok) {
        throw new Error("Failed to fetch tags data.");
      }

      const rawTags = await tagsRes.json();
      const rawResources = await resourceRes.json();

      // Unpack arrays safely from paginated or raw list payloads[cite: 20]
      const tagList: Tag[] = Array.isArray(rawTags)
        ? rawTags
        : rawTags?.data || [];

      const resourceList: Resource[] = Array.isArray(rawResources)
        ? rawResources
        : rawResources?.data || [];

      setTags(tagList);
      setAllResources(resourceList);
    } catch (err: any) {
      console.error("Fetch Tags Error:", err);
      setError("Unable to load tags. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await adminFetch("/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to create tag.");

      showToast("Tag created successfully!", "success");
      setNewTagName("");
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Error creating tag", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag || !editingTag.name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await adminFetch(`/api/tags/${editingTag.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editingTag.name.trim() }),
      });

      if (!res.ok) throw new Error("Failed to update tag.");

      showToast("Tag updated successfully!", "success");
      setEditingTag(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Error updating tag", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete tag "${name}"?`)) {
      return;
    }

    try {
      const res = await adminFetch(`/api/tags/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete tag.");

      showToast("Tag deleted successfully!", "success");
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Error deleting tag", "error");
    }
  };

  // Helper to count resources tagged with this tag name[cite: 20]
  const getResourceCountForTag = (tagName: string) => {
    const target = tagName.toLowerCase();
    return allResources.filter((r) => {
      if (!r.tags) return false;
      if (Array.isArray(r.tags)) {
        return r.tags.some((t) => t.toLowerCase() === target);
      }
      if (typeof r.tags === "string") {
        return r.tags.toLowerCase().split(",").map((t) => t.trim()).includes(target);
      }
      return false;
    }).length;
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
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Manage Tags</h1>
          <p className="text-sm text-gray-600">
            Create, rename, or delete search tags assigned to resources.
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

      {/* Create Tag Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Create New Tag</h2>
        <form onSubmit={handleCreateTag} className="flex gap-4">
          <input
            type="text"
            placeholder="Tag Name (e.g. 'Lab Equipment')"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="border border-gray-300 p-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || !newTagName.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add Tag"}
          </button>
        </form>
      </div>

      {/* Tags Table */}
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
                  Tag Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tagged Resources
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tags.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No tags found.
                  </td>
                </tr>
              ) : (
                tags.map((tag) => {
                  const count = getResourceCountForTag(tag.name);
                  return (
                    <tr key={tag.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tag.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span className="inline-block bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md text-xs font-semibold">
                          #{tag.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {count} resource{count !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => setEditingTag(tag)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id, tag.name)}
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

      {/* Edit Tag Modal */}
      {editingTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4">Edit Tag</h3>
            <form onSubmit={handleUpdateTag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tag Name</label>
                <input
                  type="text"
                  value={editingTag.name}
                  onChange={(e) =>
                    setEditingTag({ ...editingTag, name: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTag(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};