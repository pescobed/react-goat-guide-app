import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { LayoutGrid, ChevronLeft, Search, MapPin } from 'lucide-react';
import SearchBar from '../components/searchBar';

interface Resource {
  id: number;
  resource_name: string;
  description: string;
  keywords: string | null;
  location: string | null;
  view_count: number;
}

export function meta() {
  return [
    { title: "All Resources - GOAT Guide" },
    { name: "description", content: "Browse all resources available at SEU." },
  ];
}

export default function ResourcesIndex() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/resources')
      .then(res => res.json())
      .then(data => {
        // Sort alphabetically by default
        const sorted = [...data].sort((a, b) => {
          const nameA = a.resource_name || "";
          const nameB = b.resource_name || "";
          return nameA.localeCompare(nameB);
        });
        setResources(sorted);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const filtered = search
    ? resources.filter(r =>
        r.resource_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase()) ||
        r.keywords?.toLowerCase().includes(search.toLowerCase()) ||
        r.location?.toLowerCase().includes(search.toLowerCase())
      )
    : resources;

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
              <LayoutGrid className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">All Resources</h1>
              <p className="text-gray-300 mt-2">
                {loading ? 'Loading...' : `${resources.length} resources available at SEU`}
              </p>
            </div>
          </div>

          {/* Search Bar */}
            <div className="flex justify-center">
                <SearchBar 
                    value={search} 
                    onChange={setSearch} 
                    placeholder="Search Resources..." 
                />
            </div> 
        </div>
      </div>

      {/* Results Count */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {!loading && search && (
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length === 0
              ? `No resources match "${search}"`
              : `Showing ${filtered.length} of ${resources.length} resources`}
          </p>
        )}
        {!loading && !search && (
          <p className="text-sm text-gray-400 mb-4">Showing all resources alphabetically </p>
        )}
      </div>

      {/* Resources Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500 text-lg animate-pulse">Loading resources...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No resources found for "{search}"</p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-[#0F2E6A] underline hover:text-indigo-900 font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((resource) => (
              <Link
                key={resource.id}
                to={`/resource/${resource.id}`}
                className="block h-full"
              >
                <div className="relative p-6 bg-[#192E56] rounded-lg shadow-xl text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl h-full">
                  <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
                  <h3 className="text-xl font-semibold mb-2">{resource.resource_name}</h3>
                  <p className="text-sm text-gray-300 line-clamp-2 mb-3">{resource.description}</p>
                  {resource.location && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-auto">
                      <MapPin className="w-3 h-3" /> {resource.location}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}