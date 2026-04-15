import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ChevronLeft, Tag, Search, Hash, TrendingUp, Edit3, Info } from "lucide-react";

// NOTE: This app stores tags/keywords as comma-separated text on each
// resource's `keywords` field — there is no separate tags table.
// This page analyzes all keywords in use across resources, shows their
// frequency, and links you to edit the resources that use each keyword.

type KeywordEntry = {
  keyword: string;
  count: number;
  resourceIds: number[];
  resourceNames: string[];
};

export default function AdminTags() {
  const [keywordEntries, setKeywordEntries] = useState<KeywordEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/resources")
      .then((r) => r.json())
      .then((resources: any[]) => {
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
  }, []);

  const filtered = keywordEntries.filter((e) =>
    e.keyword.toLowerCase().includes(search.toLowerCase())
  );

  const totalKeywords = keywordEntries.length;
  const totalUsages = keywordEntries.reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Nav */}
        <Link
          to="/admin"
          className="inline-flex items-center text-gray-500 hover:text-[#0F2E6A] mb-6 font-semibold text-sm transition-colors"
        >
          <ChevronLeft size={18} /> Back to Dashboard
        </Link>

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

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
          <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-bold mb-1">How Keywords Work</p>
            <p>
              Keywords are stored as comma-separated values in each resource's <code className="bg-blue-100 px-1 rounded text-xs">keywords</code> field (e.g. "Tutoring, Math, Free"). To add or edit keywords, click "Edit Resource" below or use the{" "}
              <Link to="/admin" className="underline font-bold">main dashboard</Link>.
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
                    <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
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
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-1">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Resources using this keyword:
                      </p>
                      {entry.resourceNames.map((name, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                          <span className="text-sm text-gray-700 font-medium">{name}</span>
                          <Link
                            to={`/admin/edit/${entry.resourceIds[i]}`}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <Edit3 size={11} /> Edit
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-6">
            💡 Click any keyword to see which resources use it. Edit those resources to update or remove the keyword.
          </p>
        )}
      </div>
    </div>
  );
}