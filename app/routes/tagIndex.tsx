import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Tag, Search, ChevronLeft } from 'lucide-react';

export default function TagsIndex() {
  const [tags, setTags] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/resources')
      .then(res => res.json())
      .then(data => {
        const uniqueTags = Array.from(new Set(
          data.flatMap((r: any) => (r.keywords || '').split(',').map((k: string) => k.trim()).filter(Boolean))
        )).sort() as string[];
        setTags(uniqueTags);
      });
  }, []);

  const filtered = tags.filter(t => t.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0F2E6A] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="flex items-center text-gray-300 mb-6 hover:text-white"><ChevronLeft /> Back</Link>
          <h1 className="text-4xl font-bold mb-4">Explore by Category</h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input 
              type="text" placeholder="Filter tags..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-[#EDB920]"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-3">
          {filtered.map(tag => (
            <Link 
              key={tag} 
              to={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
              className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-[#EDB920] hover:shadow-md transition-all flex items-center gap-2 font-medium text-[#0F2E6A]"
            >
              <Tag className="w-4 h-4 text-[#EDB920]" /> {tag}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}