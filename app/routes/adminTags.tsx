import { useState, useEffect, useMemo } from "react";
import { Tag, Search, Hash, Plus, X, AlertCircle, CheckCircle, ChevronDown, Pencil, Trash2, Check } from "lucide-react";
import AdminNav from "../components/adminNav";

type KeywordEntry = {
  keyword: string;
  count: number;
  resourceIds: number[];
  resourceNames: string[];
};

type Toast = { msg: string; type: "success" | "error" } | null;

export default function AdminTags() {
  const [keywordEntries, setKeywordEntries] = useState<KeywordEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  
  // States for "Create New Tag" section
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [targetResourceId, setTargetResourceId] = useState("");
  
  // States for adding to existing tag
  const [addingToKeyword, setAddingToKeyword] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
  
  // States for editing tag name
  const [editingKeyword, setEditingKeyword] = useState<string | null>(null);
  const [editKeywordName, setEditKeywordName] = useState("");
  
  const [allResources, setAllResources] = useState<any[]>([]);
  const [processingTag, setProcessingTag] = useState<{ resourceId: number; keyword: string } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = () => {
    setLoading(true);
    fetch("/api/resources")
      .then((r) => r.json())
      .then((resources: any[]) => {
        setAllResources(resources);
        
        const map: Record<string, { count: number; resourceIds: number[]; resourceNames: string[] }> = {};

        resources.forEach((r) => {
          if (!r.keywords) return;
          const tags = r.keywords
            .split(",")
            .map((k: string) => k.trim().toLowerCase())
            .filter(Boolean);

          tags.forEach((tag: string) => {
            if (!map[tag]) map[tag] = { count: 0, resourceIds: [], resourceNames: [] };
            map[tag].count++;
            map[tag].resourceIds.push(r.id);
            map[tag].resourceNames.push(r.resource_name);
          });
        });

        const entries: KeywordEntry[] = Object.entries(map).map(([keyword, data]) => ({
          keyword,
          ...data,
        }));

        entries.sort((a, b) => b.count - a.count);
        setKeywordEntries(entries);
      })
      .catch(() => setError("Failed to load resource data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    return keywordEntries.filter((e) =>
      e.keyword.toLowerCase().includes(search.toLowerCase())
    );
  }, [keywordEntries, search]);

  const totalKeywords = keywordEntries.length;

  const getAvailableResources = (keyword: string) => {
    const entry = keywordEntries.find(e => e.keyword.toLowerCase() === keyword.toLowerCase());
    if (!entry) return allResources;
    const hasKeywordSet = new Set(entry.resourceIds);
    return allResources.filter(r => !hasKeywordSet.has(r.id));
  };

  const handleApplyTag = async (tagName: string, resId: string, isQuickCreate: boolean = false) => {
    if (!tagName || !resId) return;

    const resourceId = parseInt(resId);
    const resource = allResources.find(r => r.id === resourceId);
    if (!resource) return;

    setProcessingTag({ resourceId, keyword: tagName });

    const token = localStorage.getItem("admin_token");
    const currentKeywords = resource.keywords 
      ? resource.keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
      : [];

    if (!currentKeywords.map((k: string) => k.toLowerCase()).includes(tagName.toLowerCase())) {
      currentKeywords.push(tagName.trim());
    }

    try {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...resource,
          keywords: currentKeywords.join(", "),
        }),
      });

      if (res.ok) {
        showToast(`Successfully tagged "${resource.resource_name}" with "${tagName}"`, "success");
        if (isQuickCreate) {
          setNewTagName("");
          setTargetResourceId("");
          setShowAddForm(false);
        } else {
          setAddingToKeyword(null);
          setSelectedResourceId("");
        }
        fetchData();
      } else {
        showToast("Failed to update resource.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    } finally {
      setProcessingTag(null);
    }
  };

  const handleRemoveTag = async (resourceId: number, keyword: string, resourceName: string) => {
    if (!confirm(`Remove tag "${keyword}" from "${resourceName}"?`)) return;

    setProcessingTag({ resourceId, keyword });
    const resource = allResources.find(r => r.id === resourceId);
    if (!resource) return;

    const currentKeywords = resource.keywords 
      ? resource.keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
      : [];
    
    const updatedKeywords = currentKeywords.filter(
      (k: string) => k.toLowerCase() !== keyword.toLowerCase()
    );

    try {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: "PUT",
         headers: {
            "Authorization": `Bearer ${localStorage.getItem("admin_token")}`,
            "Content-Type": "application/json"
          },
        body: JSON.stringify({
          ...resource,
          keywords: updatedKeywords.join(", "),
        }),
      });

      if (res.ok) {
        showToast(`Removed "${keyword}" from "${resourceName}"`, "success");
        fetchData();
      }
    } catch {
      showToast("Connection error.", "error");
    } finally {
      setProcessingTag(null);
    }
  };

  const handleEditKeywordName = async (oldKeyword: string) => {
    if (!editKeywordName.trim() || editKeywordName.toLowerCase() === oldKeyword.toLowerCase()) {
      setEditingKeyword(null);
      return;
    }

    const newKeyword = editKeywordName.trim();
    const entry = keywordEntries.find(e => e.keyword.toLowerCase() === oldKeyword.toLowerCase());
    if (!entry) return;

    const resourcesToUpdate = entry.resourceIds.map(id => allResources.find(r => r.id === id)).filter(Boolean);
    
    if (resourcesToUpdate.length === 0) {
      showToast("No resources to update.", "error");
      setEditingKeyword(null);
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      
      // Update all resources with this tag
      const updatePromises = resourcesToUpdate.map(resource => {
        const currentKeywords = resource.keywords 
          ? resource.keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
          : [];
        
        // Replace old keyword with new keyword
        const updatedKeywords = currentKeywords.map((k: string) =>
          k.toLowerCase() === oldKeyword.toLowerCase() ? newKeyword : k
        );

        return fetch(`/api/resources/${resource.id}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...resource,
            keywords: updatedKeywords.join(", "),
          }),
        });
      });

      await Promise.all(updatePromises);
      
      showToast(`Renamed tag "${oldKeyword}" to "${newKeyword}" for ${resourcesToUpdate.length} resource(s)`, "success");
      setEditingKeyword(null);
      setEditKeywordName("");
      fetchData();
    } catch {
      showToast("Failed to update tag name.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
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
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white font-bold transition-all ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      <AdminNav />

      <div className="max-w-3xl mx-auto p-6 md:p-8">
        {/* Header with Add New Tag Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0F2E6A] rounded-xl">
              <Tag className="text-[#EDB920]" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0F2E6A]">Tags & Keywords</h1>
              <p className="text-sm text-gray-500">{totalKeywords} unique keywords</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 bg-[#0F2E6A] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all"
          >
            {showAddForm ? <X size={18} /> : <Plus size={18} />}
            {showAddForm ? "Cancel" : "Create New Tag"}
          </button>
        </div>

        {/* Quick Create Form */}
        {showAddForm && (
          <div className="bg-white p-5 rounded-2xl border-2 border-dashed border-gray-200 mb-6 space-y-4">
            <p className="text-sm font-bold text-[#0F2E6A]">Create a new keyword and assign it to a resource:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input 
                className="px-4 py-2.5 border rounded-xl focus:outline-none focus:border-[#EDB920] text-sm"
                placeholder="Tag name (e.g. 'Scholarship')"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
              <select
                className="px-4 py-2.5 border rounded-xl focus:outline-none focus:border-[#EDB920] text-sm bg-white"
                value={targetResourceId}
                onChange={(e) => setTargetResourceId(e.target.value)}
              >
                <option value="">— Select Resource —</option>
                {allResources.map(r => (
                  <option key={r.id} value={r.id}>{r.resource_name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => handleApplyTag(newTagName, targetResourceId, true)}
              disabled={!newTagName.trim() || !targetResourceId || !!processingTag}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold disabled:opacity-50 transition-colors"
            >
              {processingTag ? "Processing..." : "Create & Assign Tag"}
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:border-[#EDB920] focus:ring-2 focus:ring-yellow-100"
            placeholder="Search keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Keyword Accordion List */}
        <div className="space-y-3">
          {filtered.map((entry) => {
            const isExpanded = expandedKeyword === entry.keyword;
            const isEditing = editingKeyword === entry.keyword;
            const availableResources = getAvailableResources(entry.keyword);
            const isAdding = addingToKeyword === entry.keyword;

            return (
              <div key={entry.keyword} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => setExpandedKeyword(isExpanded ? null : entry.keyword)}
                      className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <ChevronDown size={20} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          className="flex-1 px-3 py-1 border-b-2 border-[#EDB920] focus:outline-none font-bold text-[#0F2E6A]"
                          value={editKeywordName}
                          onChange={(e) => setEditKeywordName(e.target.value)}
                          autoFocus
                        />
                        <button 
                          onClick={() => handleEditKeywordName(entry.keyword)} 
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg" 
                          title="Save"
                        >
                          <Check size={20} />
                        </button>
                        <button 
                          onClick={() => setEditingKeyword(null)} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg" 
                          title="Cancel"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <div onClick={() => setExpandedKeyword(isExpanded ? null : entry.keyword)} className="cursor-pointer flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#0F2E6A] capitalize text-lg">{entry.keyword}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                          Used by {entry.count} resource{entry.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingKeyword(entry.keyword); setEditKeywordName(entry.keyword); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit tag name"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-gray-50/50 border-t border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resources with this tag</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setAddingToKeyword(isAdding ? null : entry.keyword); }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${isAdding ? 'bg-gray-200 text-gray-600' : 'bg-[#0F2E6A] text-white hover:bg-blue-800'}`}
                      >
                        {isAdding ? <X size={14} /> : <Plus size={14} />}
                        {isAdding ? "Cancel" : "Add to Another"}
                      </button>
                    </div>

                    {isAdding && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-2">
                        <select
                          className="flex-1 p-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-blue-400"
                          value={selectedResourceId}
                          onChange={(e) => setSelectedResourceId(e.target.value)}
                        >
                          <option value="">— Select Resource —</option>
                          {availableResources.map(r => (
                            <option key={r.id} value={r.id}>{r.resource_name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleApplyTag(entry.keyword, selectedResourceId)}
                          disabled={!selectedResourceId || !!processingTag}
                          className="bg-[#0F2E6A] text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    <div className="space-y-2">
                      {entry.resourceNames.map((name, i) => {
                        const resourceId = entry.resourceIds[i];
                        return (
                          <div key={resourceId} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-sm font-bold text-gray-700">{name}</span>
                            <button
                              onClick={() => handleRemoveTag(resourceId, entry.keyword, name)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove tag"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
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