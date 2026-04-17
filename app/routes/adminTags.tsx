import { useState, useEffect, useMemo } from "react";
import { Tag, Search, Hash, TrendingUp, Plus, X, AlertCircle, CheckCircle, ChevronDown } from "lucide-react";
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
  
  const [addingToKeyword, setAddingToKeyword] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
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
  const totalUsages = keywordEntries.reduce((sum, e) => sum + e.count, 0);

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
            className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:border-[#EDB920]"
            placeholder="Search keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Keyword Accordion List */}
        <div className="space-y-3">
          {filtered.map((entry) => {
            const isExpanded = expandedKeyword === entry.keyword;
            const availableResources = getAvailableResources(entry.keyword);
            const isAdding = addingToKeyword === entry.keyword;

            return (
              <div key={entry.keyword} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <button
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-gray-50"
                  onClick={() => setExpandedKeyword(isExpanded ? null : entry.keyword)}
                >
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0">
                    <Hash size={20} className="text-[#EDB920]" />
                  </div>
                  <div className="grow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F2E6A] capitalize text-lg">{entry.keyword}</span>
                      <ChevronDown size={18} className={`text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Used by {entry.count} resource{entry.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </button>

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
                              className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-tight"
                            >
                              Remove
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