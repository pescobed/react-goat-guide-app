import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { 
  MapPin, Search, ExternalLink, BookOpen, Info, 
  ChevronDown, X, Plus, TrendingUp 
} from "lucide-react";
import AdminNav from "../components/adminNav";

// Updated type to include the resource list for the accordion
type LocationEntry = {
  name: string;
  resourceCount: number;
  resources: { id: number; name: string }[];
};

export default function AdminLocations() {
  const [locationEntries, setLocationEntries] = useState<LocationEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);

  useEffect(() => {
    // Fetch distinct locations and all resources to group them
    Promise.all([
      fetch("/api/locations").then((r) => r.json()),
      fetch("/api/resources").then((r) => r.json()),
    ])
      .then(([locations, resources]: [string[], any[]]) => {
        const entries: LocationEntry[] = locations.map((locName) => {
          // Find all resources that match this location string
          const connectedResources = resources
            .filter((r) => r.location === locName)
            .map((r) => ({
              id: r.id,
              name: r.resource_name || "Untitled Resource",
            }));

          return {
            name: locName,
            resourceCount: connectedResources.length,
            resources: connectedResources,
          };
        });

        // Sort by most resources first
        entries.sort((a, b) => b.resourceCount - a.resourceCount);
        setLocationEntries(entries);
      })
      .catch(() => setError("Failed to load location data."))
      .finally(() => setLoading(false));
  }, []);

  // Filtered list based on search bar
  const filtered = useMemo(() => {
    return locationEntries.filter((loc) =>
      loc.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [locationEntries, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNav />
        <div className="text-center py-20 text-gray-400">Loading locations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div className="max-w-3xl mx-auto p-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0F2E6A] rounded-xl shadow-sm">
              <MapPin className="text-[#EDB920]" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0F2E6A]">Locations</h1>
              <p className="text-sm text-gray-500">
                {locationEntries.length} unique campus locations
              </p>
            </div>
          </div>
          
          <Link
            to="/admin/edit/add-resource"
            className="flex items-center justify-center gap-2 bg-[#0F2E6A] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            <Plus size={18} /> Add New Location
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:border-[#EDB920] focus:ring-2 focus:ring-yellow-100 transition-all shadow-sm"
            placeholder="Search by building name or room..."
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

        {/* Error Handling */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 flex items-center gap-2">
            <Info size={18} /> {error}
          </div>
        )}

        {/* Location List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <MapPin size={40} className="mx-auto text-gray-200 mb-2" />
              <p className="text-gray-500 font-medium">No locations match your search.</p>
            </div>
          ) : (
            filtered.map((loc) => {
              const isExpanded = expandedLocation === loc.name;
              
              return (
                <div 
                  key={loc.name} 
                  className={`bg-white border rounded-2xl shadow-sm transition-all overflow-hidden ${
                    isExpanded ? 'border-[#EDB920] ring-1 ring-yellow-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => setExpandedLocation(isExpanded ? null : loc.name)}
                    className="w-full p-4 flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        isExpanded ? 'bg-yellow-100' : 'bg-gray-50 group-hover:bg-yellow-50'
                      }`}>
                        <MapPin size={20} className={isExpanded ? 'text-[#EDB920]' : 'text-gray-400 group-hover:text-[#EDB920]'} />
                      </div>
                      <div>
                        <p className="font-bold text-[#0F2E6A] text-lg leading-tight">{loc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {loc.resourceCount} Resource{loc.resourceCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown 
                      className={`text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#EDB920]' : ''}`} 
                      size={20} 
                    />
                  </button>

                  {/* Expanded Resources (Accordion) */}
                  {isExpanded && (
                    <div className="bg-gray-50/50 border-t border-gray-100 px-4 py-4 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                        Linked to this location
                      </p>
                      <div className="grid gap-2">
                        {loc.resources.map((res) => (
                          <div 
                            key={res.id} 
                            className="flex items-center justify-between py-2.5 px-4 bg-white rounded-xl border border-gray-100 group/item hover:border-blue-200 hover:shadow-sm transition-all"
                          >
                            <span className="text-sm font-bold text-gray-700 group-hover/item:text-[#0F2E6A]">
                              {res.name}
                            </span>
                            <div className="flex items-center gap-3">
                              <Link 
                                to={`/admin/edit/${res.id}`}
                                className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-tight"
                              >
                                Edit
                              </Link>
                              <a
                                href={`/location/${encodeURIComponent(loc.name)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-300 hover:text-[#EDB920] transition-colors"
                                title="View on main site"
                              >
                                <ExternalLink size={14} />
                              </a>
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

        {/* Help text */}
        {!loading && filtered.length > 0 && (
          <div className="mt-10 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
            <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              Locations are generated automatically from your resources. To rename a location, edit the 
              resource and change its "Physical Location" field. If a location has zero resources, 
              it will disappear from this list automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}