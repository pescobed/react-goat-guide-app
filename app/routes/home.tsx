import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { Search, ChevronUp } from 'lucide-react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "The GOAT Guide Home" },
    { name: "description", content: "Welcome to a comprehensive SEU resource guide!" },
  ];
}

interface Resource {
  id: number;
  resource_name: string;
  description: string;
  keywords: string | null;
  location: string | null;
}

const TagButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 text-sm rounded-full bg-[#0F2E6A] border-2 border-[#EDB920] text-gray-200 hover:border-white hover:text-white transition-colors duration-200 whitespace-nowrap"
  >
    {children}
  </button>
);

const ResourceCard = ({ id, title, description }: { id: number; title: string; description: string }) => (
  <Link to={`/resource/${id}`} className="block h-full">
    <div className="relative p-6 bg-[#192E56] rounded-lg shadow-xl text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl h-full">
      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-300 line-clamp-2">{description}</p>
    </div>
  </Link>
);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/resources')
      .then(res => res.json())
      .then(data => setResources(data))
      .catch(err => console.error("Failed to fetch resources:", err));
  }, []);

  // Derive unique tags from keywords column (comma-separated in DB)
  const allTags = Array.from(
    new Set(
      resources
        .flatMap(r => (r.keywords || '').split(',').map(k => k.trim()).filter(Boolean))
    )
  ).sort();

  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResources = resources.filter(r =>
    r.resource_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.keywords?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTagClick = (tag: string) => {
    navigate(`/tags/${encodeURIComponent(tag.toLowerCase())}`);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900">

      {/* Hero Section */}
      <div className="bg-[#0F2E6A] text-white pb-20 pt-16 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <main className="text-center mb-16">
            <div className="flex flex-col items-center mb-10">
              <img src="/goat.svg" alt="Goat Icon" className="w-24 h-24 mb-6 opacity-90" />
              <h2 className="text-4xl md:text-6xl font-extrabold mb-4">The GOAT Guide</h2>
              <p className="text-lg md:text-xl text-blue-200">Your comprehensive resource guide for SEU</p>
            </div>

            {/* Search Bar */}
            <div className="flex justify-center mt-10">
              <div className="w-full max-w-2xl flex items-center bg-white rounded-full p-2 shadow-xl">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 p-2 text-gray-800 placeholder-gray-500 text-lg outline-none"
                />
                <button aria-label="Search" className="p-3 text-gray-600 hover:text-gray-900 transition-colors">
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </div>
          </main>

          {/* Tag Buttons */}
          <section className="mt-12">
            <div className="flex flex-wrap justify-center gap-3">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag, index) => (
                  <TagButton key={index} onClick={() => handleTagClick(tag)}>{tag}</TagButton>
                ))
              ) : (
                <p className="text-gray-400 italic">No tags match your search.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 relative z-0">
        <div className="mx-auto max-w-7xl">
          <h4 className="text-3xl font-extrabold text-[#192E56] mb-10 text-center md:text-left">
            {searchQuery ? `Results for "${searchQuery}"` : "Explore Popular Resources"}
          </h4>

          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  id={resource.id}
                  title={resource.resource_name}
                  description={resource.description}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-gray-600">No resources found matching "{searchQuery}".</p>
              <button onClick={() => setSearchQuery("")} className="mt-4 text-blue-600 underline hover:text-blue-800">
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#C3E3F6] py-4 text-black shadow-md border-t border-blue-200">
        <div className="mx-auto max-w-7xl px-4 flex justify-between items-center">
          <div>
            <p className="text-lg font-bold">Not sure where to start?</p>
            <p className="text-sm font-medium">Use the tags at the top to find resources that match your needs</p>
          </div>
          <button onClick={scrollToTop} className="p-3 bg-[#0F2E6A] text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors" aria-label="Scroll to top">
            <ChevronUp className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
}
