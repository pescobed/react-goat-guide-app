import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Tag, Search, ChevronLeft, X } from 'lucide-react'; // Added X for clear button
import SearchBar from '../components/searchBar';

export default function TagsIndex() {
  const [tags, setTags] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/resources')
      .then(res => res.json())
      .then(data => {
        const uniqueTags = Array.from(new Set(
          data.flatMap((r: any) => (r.keywords || '').split(',').map((k: string) => k.trim()).filter(Boolean))
        )).sort() as string[];
        setTags(uniqueTags);
        setLoading(false);
      });
  }, []);

  const filtered = tags.filter(t => t.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {/* Hero Header */}
      <div className="bg-[#0F2E6A] text-white pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center text-gray-300 mb-6 hover:text-white transition-colors font-medium">
            <ChevronLeft className="w-5 h-5 mr-1" /> <span className="text-lg">Back</span>
          </Link>
          
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Explore by Category</h1>
            <p className="text-gray-300 mt-2">
               {loading ? 'Loading...' : `Browsing ${tags.length} unique topics`}
            </p>
          </div>

          {/* Search Bar */}
           <div className="flex justify-center">
                <SearchBar 
                    value={search} 
                    onChange={setSearch} 
                    placeholder="Search Tags..." 
                />
            </div> 
          </div>
        </div>

      {/* Tags Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No categories found matching "{search}"</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {filtered.map(tag => (
              <Link 
                key={tag} 
                to={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-[#EDB920] hover:shadow-md transition-all flex items-center gap-2 font-semibold text-[#0F2E6A]"
              >
                <Tag className="w-4 h-4 text-[#EDB920]" /> {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}