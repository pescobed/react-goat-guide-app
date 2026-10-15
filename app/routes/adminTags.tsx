import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { 
  Tag as TagIcon, Search, Plus, ChevronDown, X, Pencil, 
  Trash2, CheckCircle, AlertCircle, Check
} from "lucide-react";
import AdminNav from "../components/adminNav";
import { adminFetch } from "../utils/api";
import { unwrapList } from "../utils/resourceHelpers";

type TagEntry = {
  name: string;
  resourceCount: number;
  resources: { id: number; name: string; fullResource: any }[];
};

type Toast = { msg: string; type: "success" | "error" } | null;

export default function AdminTags() {
  const [tagEntries, setTagEntries] = useState<TagEntry[]>([]);
  const [allResources, setAllResources] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedTag, setExpandedTag] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  // States for editing tag name
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState("");

  // States for adding resources to tag
  const [addingToTag, setAddingToTag] = useState<string | null>(null);
  const [resourceSearch, setResourceSearch] = useState("");

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getTagsFromResource = (resource: any): string[] => {
    if (Array.isArray(resource.tags)) return resource.tags;
    if (typeof resource.keywords === 'string') {
      return resource.keywords.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    return [];
  };

  const fetchData = () => {
    adminFetch("/api/resources")
      .then((r) => r.json())
      .then((rawResources) => {
        const resources: any[] = unwrapList<any>(rawResources);
        setAllResources(resources);

        const tagMap: Record<string, any[]> = {};

        resources.forEach((res) => {
          const tags = getTagsFromResource(res);
          tags.forEach((tag) => {
            if (!tagMap[tag]) tagMap[tag] = [];
            tagMap[tag].push(res);
          });
        });

        const entries: TagEntry[] = Object.keys(tagMap).map((tagName) => {
          const connectedResources = tagMap[tagName].map((r) => ({
            id: r.id,
            name: r.resource_name || "Untitled Resource",
            fullResource: r,
          }));

          return {
            name: tagName,
            resourceCount: connectedResources.length,
            resources: connectedResources,
          };
        });

        entries.sort((a, b) => b.resourceCount - a.resourceCount);
        setTagEntries(entries);
      })
      .catch(() => setError("Failed to load tag data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return tagEntries.filter((tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [tagEntries, search]);

  const handleEditTagName = async (oldName: string) => {
    if (!editTagName.trim() || editTagName === oldName) {
      setEditingTag(null);
      return;
    }

    const newName = editTagName.trim();
    const resourcesWithTag = allResources.filter((r) =>
      getTagsFromResource(r).includes(oldName)
    );

    try {
      const updatePromises = resourcesWithTag.map((resource) => {
        const currentTags = getTagsFromResource(resource);
        const updatedTags = currentTags.map((t) => (t === oldName ? newName : t));
        const updatedKeywords = updatedTags.join(", ");

        return adminFetch(`/api/resources/${resource.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...resource,
            keywords: updatedKeywords,
            tags: updatedTags,
          }),
        });
      });

      await Promise.all(updatePromises);

      showToast(`Renamed tag "${oldName}" to "${newName}"`, "success");
      setEditingTag(null);
      setEditTagName("");
      fetchData();
    } catch {
      showToast("Failed to rename tag.", "error");
    }
  };

  const handleRemoveTagFromResource = async (tagName: string, resource: any) => {
    if (!confirm(`Remove tag "${tagName}" from "${resource.resource_name}"?`)) return;

    try {
      const currentTags = getTagsFromResource(resource);
      const updatedTags = currentTags.filter((t) => t !== tagName);
      const updatedKeywords = updatedTags.join(", ");

      const res = await adminFetch(`/api/resources/${resource.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...resource,
          keywords: updatedKeywords,
          tags: updatedTags,
        }),
      });

      if (res.ok) {
        showToast(`Removed tag "${tagName}" from resource`, "success");
        fetchData();
      }
    } catch {
      showToast("Failed to update resource tag.", "error");
    }
  };

  const handleAddResourceToTag = async (resourceId: number, tagName: string) => {
    const resource = allResources.find((r) => r.id === resourceId);
    if (!resource) return;

    try {
      const currentTags = getTagsFromResource(resource);
      if (currentTags.includes(tagName)) return;

      const updatedTags = [...currentTags, tagName];
      const updatedKeywords = updatedTags.join(", ");

      const res = await adminFetch(`/api/resources/${resourceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...resource,
          keywords: updatedKeywords,
          tags: updatedTags,
        }),
      });

      if (res.ok) {
        showToast(`Added tag "${tagName}" to "${resource.resource_name}"`, "success");
        setAddingToTag(null);
        setResourceSearch("");
        fetchData();
      }
    } catch {
      showToast("Failed to add tag to resource.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#EDB920] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#0F2E6A] font-bold">Loading Tags...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white font-bold transition-all ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-3xl mx-auto p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0F2E6A] rounded-xl shadow-sm">
              <TagIcon className="text-[#EDB920]" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0F2E6A]">Tags</h1>
              <p className="text-sm text-gray-500">
                {tagEntries.length} unique resource keywords
              </p>
            </div>
          </div>

          <Link
            to="/admin/edit/add-resource"
            className="flex items-center justify-center gap-2 bg-[#0F2E6A] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            <Plus size={18} /> Add New Resource
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:border-[#EDB920] focus:ring-2 focus:ring-yellow-100 transition-all shadow-sm"
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Tags Accordion List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <TagIcon size={40} className="mx-auto text-gray-200 mb-2" />
              <p className="text-gray-500 font-medium">No tags match your search.</p>
            </div>
          ) : (
            filtered.map((tag) => {
              const isExpanded = expandedTag === tag.name;
              const isEditing = editingTag === tag.name;
              const isAdding = addingToTag === tag.name;

              const availableResources = allResources.filter(
                (r) => !getTagsFromResource(r).includes(tag.name)
              );
              const filteredAvailable = resourceSearch.trim()
                ? availableResources.filter((r) =>
                    r.resource_name?.toLowerCase().includes(resourceSearch.toLowerCase())
                  )
                : availableResources;

              return (
                <div
                  key={tag.name}
                  className={`bg-white border rounded-2xl shadow-sm transition-all overflow-hidden ${
                    isExpanded ? "border-[#EDB920] ring-1 ring-yellow-50" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => setExpandedTag(isExpanded ? null : tag.name)}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <ChevronDown
                          size={20}
                          className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            className="flex-1 px-3 py-1 border-b-2 border-[#EDB920] focus:outline-none font-bold text-[#0F2E6A]"
                            value={editTagName}
                            onChange={(e) => setEditTagName(e.target.value)}
                            autoFocus
                          />
                          <button
                            onClick={() => handleEditTagName(tag.name)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Save"
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={() => setEditingTag(null)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Cancel"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setExpandedTag(isExpanded ? null : tag.name)}
                          className="cursor-pointer flex-1"
                        >
                          <p className="font-bold text-[#0F2E6A] text-lg leading-tight">#{tag.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              {tag.resourceCount} Tagged Resource{tag.resourceCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTag(tag.name);
                          setEditTagName(tag.name);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit tag name"
                      >
                        <Pencil size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Resources View */}
                  {isExpanded && (
                    <div className="bg-gray-50/50 border-t border-gray-100 px-4 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          Resources with this tag
                        </p>
                        <button
                          onClick={() => setAddingToTag(isAdding ? null : tag.name)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                            isAdding ? "bg-gray-200 text-gray-600" : "bg-[#0F2E6A] text-white hover:bg-blue-800"
                          }`}
                        >
                          {isAdding ? <X size={14} /> : <Plus size={14} />}
                          {isAdding ? "Cancel" : "Add Resource"}
                        </button>
                      </div>

                      {/* Add Resource Search Input */}
                      {isAdding && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                          <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-blue-400"
                              placeholder="Search resources to add tag..."
                              value={resourceSearch}
                              onChange={(e) => setResourceSearch(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {filteredAvailable.length === 0 ? (
                              <p className="text-xs text-gray-500 italic p-2">No available resources found.</p>
                            ) : (
                              filteredAvailable.slice(0, 10).map((res) => (
                                <button
                                  key={res.id}
                                  onClick={() => handleAddResourceToTag(res.id, tag.name)}
                                  className="w-full text-left p-2 hover:bg-blue-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                                >
                                  {res.resource_name}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid gap-2">
                        {tag.resources.map((res) => (
                          <div
                            key={res.id}
                            className="flex items-center justify-between py-2.5 px-4 bg-white rounded-xl border border-gray-100 group/item hover:border-blue-200 hover:shadow-sm transition-all"
                          >
                            <span className="text-sm font-bold text-gray-700 group-hover/item:text-[#0F2E6A]">
                              {res.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/admin/edit/${res.id}`}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit resource"
                              >
                                <Pencil size={16} />
                              </Link>
                              <button
                                onClick={() => handleRemoveTagFromResource(tag.name, res.fullResource)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove tag from resource"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}