import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { MapPin, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import SearchBar from 'app/components/searchBar';

interface Resource {
  id: number;
  location: string | null;
}

export function meta() {
  return [{ title: "Campus Locations - GOAT Guide" }];
}

export default function LocationsIndex() {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/resources')
      .then(res => res.json())
      .then((data: Resource[]) => {
        const unique = Array.from(
          new Set(
            data
              .map(r => r.location?.trim())
              .filter(Boolean) as string[]
          )
        ).sort();
        setLocations(unique);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const filtered = locations.filter(loc =>
    loc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">

      {/* Hero */}
      <div className="bg-[#0F2E6A] text-white pt-12 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center text-gray-300 hover:text-white transition-colors mb-6 font-medium"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-lg">Back</span>
          </Link>

          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-[#EDB920] rounded-lg text-[#0F2E6A]">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Campus Locations</h1>
              <p className="text-gray-300 mt-2">
                {loading ? 'Loading...' : `${locations.length} locations on campus`}
              </p>
            </div>
          </div>

          {/* Search Bar */}
            <div className="flex justify-center">
                <SearchBar 
                    value={search} 
                    onChange={setSearch} 
                    placeholder="Search Locations on Campus..." 
                />
            </div> 
        </div>
      </div>

      {/* Results Count */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {!loading && search && (
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length === 0
              ? `No locations match "${search}"`
              : `Showing ${filtered.length} of ${locations.length} locations`}
          </p>
        )}
      </div>

      {/* Locations Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500 text-lg animate-pulse">Loading locations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No locations found for "{search}"</p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-[#0F2E6A] underline hover:text-indigo-900 font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((loc) => (
              <Link
                key={loc}
                to={`/location/${encodeURIComponent(loc)}`}
                className="group flex items-center justify-between p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-[#EDB920] hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0F2E6A] rounded-lg text-[#EDB920] group-hover:bg-[#EDB920] group-hover:text-[#0F2E6A] transition-colors duration-200 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-[#0F2E6A] group-hover:text-indigo-900 leading-tight">
                    {loc}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#EDB920] transition-colors duration-200 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}