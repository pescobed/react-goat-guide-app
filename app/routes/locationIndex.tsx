import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBar from '../components/searchBar';
import { unwrapList } from '../utils/resourceHelpers';

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
      .then((json) => {
        const data = unwrapList<Resource>(json);
        const uniqueRaw = Array.from(
          new Set(data.map(r => r.location?.trim()).filter(Boolean) as string[])
        );

        // Grouping Logic: If a location string starts with a number, 
        // treat it as "Off-Campus" to avoid duplicate boxes for different addresses.
        const grouped = new Set<string>();
        
        uniqueRaw.forEach(loc => {
          if (/^\d/.test(loc)) {
            grouped.add("Off-Campus");
          } else {
            grouped.add(loc);
          }
        });

        setLocations(Array.from(grouped).sort());
        setLoading(false);
      })
      .catch(err => { 
        console.error("Database fetch error:", err); 
        setLoading(false); 
      });
  }, []);

  const filtered = locations.filter(loc =>
    loc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <div className="bg-[#0F2E6A] text-white pt-12 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center text-gray-300 hover:text-white mb-6 font-medium">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-lg">Back to Home</span>
          </Link>

          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-[#EDB920] rounded-lg text-[#0F2E6A]">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Resource Locations</h1>
              <p className="text-gray-300 mt-2">
                {loading ? 'Loading...' : `${locations.length} location categories discovered`}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <SearchBar value={search} onChange={setSearch} placeholder="Search for locations..." />
          </div> 
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20 animate-pulse text-gray-500">Loading directory...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((loc) => (
              <Link
                key={loc}
                to={`/location/${encodeURIComponent(loc)}`}
                className="group flex items-center justify-between p-5 bg-white rounded-xl border-2 border-gray-100 hover:border-[#EDB920] hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0F2E6A] rounded-lg text-[#EDB920] group-hover:bg-[#EDB920] group-hover:text-[#0F2E6A] transition-colors shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-[#0F2E6A] leading-tight">{loc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#EDB920] transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
