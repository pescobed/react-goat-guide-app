import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { Search, ChevronUp, Tag, LayoutGrid } from 'lucide-react';

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
  view_count: number;
}

const TagButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 text-sm rounded-full bg-[#0F2E6A] border-2 border-[#EDB920] text-gray-200 hover:border-white hover:text-white transition-colors duration-200 whitespace-nowrap"
  >
    {children}
  </button>
);

const TAG_LIMIT = 24;

const TagTicker = ({ tags, onTagClick }: { tags: string[]; onTagClick: (tag: string) => void }) => {
  const limited = tags.slice(0, TAG_LIMIT);
  const doubled = [...limited, ...limited];

  return (
    <div
      style={{
        overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          gap: 12px;
          width: max-content;
          animation: ticker-scroll 30s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="ticker-track py-2">
        {doubled.map((tag, i) => (
          <TagButton key={i} onClick={() => onTagClick(tag)}>
            {tag}
          </TagButton>
        ))}
      </div>
    </div>
  );
};

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

  const allTags = Array.from(
  new Set(
    Array.isArray(resources) // Add this check
      ? resources.flatMap(r => (r.keywords || '').split(',').map(k => k.trim()).filter(Boolean))
      : []
  )
  ).sort();

  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // When searching: filter normally. When not: sort by most viewed
  const filteredResources = searchQuery
    ? resources.filter(r =>
        r.resource_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.keywords?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [...resources].sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0)).slice(0, 6);

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
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-3 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
                  >
                    Clear
                  </button>
                ) : (
                  <button aria-label="Search" className="p-3 text-gray-600 hover:text-gray-900 transition-colors">
                    <Search className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          </main>

          {/* Tag Ticker */}
          <section className="mt-12">
            {filteredTags.length > 0 ? (
              <TagTicker tags={filteredTags} onTagClick={handleTagClick} />
            ) : (
              <p className="text-center text-gray-400 italic">No tags match your search.</p>
            )}

            {/* Browse All Tags — only show when not actively searching */}
            {!searchQuery && (
              <div className="text-center mt-6">
                <Link
                  to="/tags"
                  className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-medium transition-colors underline underline-offset-4"
                >
                  <Tag className="w-4 h-4" />
                  Browse All Tags
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 relative z-0">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <h4 className="text-3xl font-extrabold text-[#192E56]">
              {searchQuery ? `Results for "${searchQuery}"` : "Most Viewed Resources"}
            </h4>
            {/* Browse All Resources — only show when not searching */}
            {!searchQuery && (
              <Link
                to="/resources"
                className="inline-flex items-center gap-2 text-[#0F2E6A] hover:text-indigo-900 font-medium transition-colors underline underline-offset-4 text-sm"
              >
                <LayoutGrid className="w-4 h-4" />
                View All Resources
              </Link>
            )}
          </div>

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