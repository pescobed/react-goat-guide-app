import { useState, useEffect } from "react";
import { Tag, Search, Hash, TrendingUp, Plus, X, AlertCircle, CheckCircle } from "lucide-react";
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
        
        // Parse and aggregate all keywords across all resources
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

        // Sort by usage count
        entries.sort((a, b) => b.count - a.count);
        setKeywordEntries(entries);
      })
      .catch(() => setError("Failed to load resource data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = keywordEntries.filter((e) =>
    e.keyword.toLowerCase().includes(search.toLowerCase())
  );

  const totalKeywords = keywordEntries.length;
  const totalUsages = keywordEntries.reduce((sum, e) => sum + e.count, 0);

  // Get resources that don't have this keyword
  const getAvailableResources = (keyword: string) => {
    const entry = keywordEntries.find(e => e.keyword === keyword);
    if (!entry) return allResources;
    
    const hasKeywordSet = new Set(entry.resourceIds);
    return allResources.filter(r => !hasKeywordSet.has(r.id));
  };

  const handleAddTagToResource = async () => {
    if (!addingToKeyword || !selectedResourceId) return;

    const resourceId = parseInt(selectedResourceId);
    const resource = allResources.find(r => r.id === resourceId);
    if (!resource) return;

    setProcessingTag({ resourceId, keyword: addingToKeyword });

    // Get current keywords
    const token = localStorage.getItem("admin_token");
    const currentKeywords = resource.keywords 
      ? resource.keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
      : [];

    // Add new keyword if not already present
    if (!currentKeywords.map((k: string) => k.toLowerCase()).includes(addingToKeyword.toLowerCase())) {
      currentKeywords.push(addingToKeyword);
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
        showToast(`Added "${addingToKeyword}" to "${resource.resource_name}"`, "success");
        setAddingToKeyword(null);
        setSelectedResourceId("");
        fetchData();
      } else {
        showToast("Failed to add tag.", "error");
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

    // Remove keyword from resource
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
      } else {
        showToast("Failed to remove tag.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    } finally {
      setProcessingTag(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white font-semibold ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Admin Navigation */}
      <AdminNav />

      <div className="max-w-3xl mx-auto p-6 md:p-8">
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#0F2E6A] rounded-xl">
            <Tag className="text-[#EDB920]" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0F2E6A]">Tags & Keywords</h1>
            <p className="text-sm text-gray-500">
              {totalKeywords} unique keyword{totalKeywords !== 1 ? "s" : ""} · {totalUsages} total usages
            </p>
          </div>
        </div>

        {/* Stats row */}
        {!loading && keywordEntries.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Unique Keywords", value: totalKeywords },
              { label: "Total Usages", value: totalUsages },
              { label: "Most Used", value: keywordEntries[0]?.keyword || "—" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                <p className="text-xl font-black text-[#0F2E6A] truncate">{s.value}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:border-[#EDB920] shadow-sm"
            placeholder="Filter keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Keyword List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Analyzing keywords...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">
            No keywords found.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => {
              const isExpanded = expandedKeyword === entry.keyword;
              const availableResources = getAvailableResources(entry.keyword);
              const isAdding = addingToKeyword === entry.keyword;

              return (
                <div
                  key={entry.keyword}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <button
                    className="w-full p-4 flex items-center gap-4 text-left"
                    onClick={() => setExpandedKeyword(isExpanded ? null : entry.keyword)}
                  >
                    {/* Usage bar visual */}
                    <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                      <Hash size={18} className="text-[#EDB920]" />
                    </div>

                    <div className="grow">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#0F2E6A] capitalize">{entry.keyword}</span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                          <TrendingUp size={12} className="text-green-400" />
                          {entry.count} resource{entry.count !== 1 ? "s" : ""}
                        </div>
                      </div>
                      {/* Usage bar */}
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#EDB920] rounded-full transition-all"
                          style={{
                            width: `${Math.max(8, (entry.count / (keywordEntries[0]?.count || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Expanded resource list */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Resources using this keyword:
                        </p>
                        <button
                          onClick={() => setAddingToKeyword(isAdding ? null : entry.keyword)}
                          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                            isAdding
                              ? "bg-gray-200 text-gray-700"
                              : "bg-[#0F2E6A] text-white hover:bg-blue-800"
                          }`}
                        >
                          {isAdding ? (
                            <><X size={12} /> Cancel</>
                          ) : (
                            <><Plus size={12} /> Add to Resource</>
                          )}
                        </button>
                      </div>

                      {/* Add tag form */}
                      {isAdding && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-bold text-blue-800 mb-2">
                            Add "{entry.keyword}" tag to a resource:
                          </p>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 p-2 border border-blue-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
                              value={selectedResourceId}
                              onChange={(e) => setSelectedResourceId(e.target.value)}
                            >
                              <option value="">— Select Resource —</option>
                              {availableResources.map((r) => (
                                <option key={r.id} value={r.id}>{r.resource_name}</option>
                              ))}
                            </select>
                            <button
                              onClick={handleAddTagToResource}
                              disabled={!selectedResourceId || !!processingTag}
                              className="bg-[#0F2E6A] hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"
                            >
                              {processingTag ? "..." : "Add"}
                            </button>
                          </div>
                          {availableResources.length === 0 && (
                            <p className="text-xs text-blue-700 mt-2">
                              All resources already have this tag.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Resource list */}
                      <div className="space-y-1">
                        {entry.resourceNames.map((name, i) => {
                          const resourceId = entry.resourceIds[i];
                          const isProcessing = processingTag?.resourceId === resourceId && processingTag?.keyword === entry.keyword;

                          return (
                            <div key={i} className="flex items-center justify-between py-2 px-2 border-b border-gray-100 last:border-0 hover:bg-white rounded transition-colors">
                              <span className="text-sm text-gray-700 font-medium">{name}</span>
                              <button
                                onClick={() => handleRemoveTag(resourceId, entry.keyword, name)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-white hover:bg-red-600 font-bold px-2.5 py-1 rounded-lg transition-all disabled:opacity-50"
                                title="Remove this tag from resource"
                              >
                                <X size={11} /> {isProcessing ? "..." : "Remove"}
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
        )}

        {filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-6">
            💡 Click any keyword to manage which resources use it. You can add or remove tags without editing the full resource.
          </p>
        )}
      </div>
    </div>
  );
}