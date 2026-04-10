import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Building2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import SearchBar from 'app/components/searchBar';

interface Department {
  id: number;
  name: string;
  resource_count: number;
}

export function meta() {
  return [
    { title: "Departments - GOAT Guide" },
    { name: "description", content: "Browse all SEU departments and their resources." },
  ];
}

export default function DepartmentsIndex() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => { setDepartments(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
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
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Departments</h1>
              <p className="text-gray-300 mt-2">
                {loading ? 'Loading...' : `${departments.length} departments at SEU`}
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
              ? `No departments match "${search}"`
              : `Showing ${filtered.length} of ${departments.length} departments`}
          </p>
        )}
      </div>

      {/* Departments Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500 text-lg animate-pulse">Loading departments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No departments found for "{search}"</p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-[#0F2E6A] underline hover:text-indigo-900 font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((dept) => (
              <Link
                key={dept.id}
                to={`/department/${dept.id}`}
                className="group flex items-center justify-between p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-[#EDB920] hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0F2E6A] rounded-lg text-[#EDB920] group-hover:bg-[#EDB920] group-hover:text-[#0F2E6A] transition-colors duration-200 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F2E6A] group-hover:text-indigo-900 leading-tight">
                      {dept.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {dept.resource_count} resource{dept.resource_count !== 1 ? 's' : ''}
                    </p>
                  </div>
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