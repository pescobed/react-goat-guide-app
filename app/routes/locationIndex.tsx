import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBar from '../components/searchBar';
import { unwrapList } from '../utils/resourceHelpers';

interface Building {
  id: number;
  building_name: string;
  rooms: {
    id: number;
    name: string;
    room_number: string;
    resource_count: number;
  }[];
}

export function meta() {
  return [{ title: "Campus Locations - GOAT Guide" }];
}

export default function LocationsIndex() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then((json) => {
        const data = unwrapList<Building>(json);
        setBuildings(data);
        setLoading(false);
      })
      .catch(err => { 
        console.error("Database fetch error:", err); 
        setLoading(false); 
      });
  }, []);

  const filtered = buildings.filter(b =>
    b.building_name.toLowerCase().includes(search.toLowerCase())
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
                {loading ? 'Loading...' : `${buildings.length} campus buildings discovered`}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <SearchBar value={search} onChange={setSearch} placeholder="Search for buildings..." />
          </div> 
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20 animate-pulse text-gray-500">Loading directory...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((b) => (
              <Link
                key={b.id}
                to={`/location/${b.id}`}
                className="group flex items-center justify-between p-5 bg-white rounded-xl border-2 border-gray-100 hover:border-[#EDB920] hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0F2E6A] rounded-lg text-[#EDB920] group-hover:bg-[#EDB920] group-hover:text-[#0F2E6A] transition-colors shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F2E6A] leading-tight">{b.building_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {b.rooms?.length || 0} room location{b.rooms?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
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