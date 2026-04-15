import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ChevronLeft, MapPin, Search, ExternalLink, BookOpen, Info } from "lucide-react";

// NOTE: Locations in this system are NOT stored in a separate table.
// They are text fields on individual resources. This page reads the
// distinct location values from /api/locations and lets you navigate
// to view/edit the resources at each location.

type LocationEntry = {
  name: string;
  resourceCount: number;
};

export default function AdminLocations() {
  const [locationEntries, setLocationEntries] = useState<LocationEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch distinct locations AND all resources to compute counts
    Promise.all([
      fetch("/api/locations").then((r) => r.json()),
      fetch("/api/resources").then((r) => r.json()),
    ])
      .then(([locations, resources]: [string[], any[]]) => {
        // Build location → count map
        const countMap: Record<string, number> = {};
        resources.forEach((r) => {
          if (r.location) {
            countMap[r.location] = (countMap[r.location] || 0) + 1;
          }
        });

        const entries: LocationEntry[] = locations.map((loc) => ({
          name: loc,
          resourceCount: countMap[loc] ?? 0,
        }));

        // Sort by resource count desc
        entries.sort((a, b) => b.resourceCount - a.resourceCount);
        setLocationEntries(entries);
      })
      .catch(() => setError("Failed to load location data."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = locationEntries.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  );

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
            <MapPin className="text-[#EDB920]" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0F2E6A]">Campus Locations</h1>
            <p className="text-sm text-gray-500">
              {locationEntries.length} unique location{locationEntries.length !== 1 ? "s" : ""} across all resources
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
          <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-bold mb-1">How Locations Work</p>
            <p>
              Locations are text fields set on each individual resource — not a separate table. To change a resource's location, edit the resource directly from the{" "}
              <Link to="/admin" className="underline font-bold">main dashboard</Link>. Locations shown here are automatically derived from all resources.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:border-[#EDB920] shadow-sm"
            placeholder="Filter locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Location Cards */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading locations...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">
            No locations found.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((loc) => (
              <div
                key={loc.name}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-[#EDB920] hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-[#EDB920]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0F2E6A]">{loc.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <BookOpen size={11} />
                      {loc.resourceCount} resource{loc.resourceCount !== 1 ? "s" : ""} at this location
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Link to public location view */}
                  <a
                    href={`/location/${encodeURIComponent(loc.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View Public <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-6">
            💡 To update a location name, edit the relevant resource(s) from the main dashboard and change the "Physical Location" field.
          </p>
        )}
      </div>
    </div>
  );
}