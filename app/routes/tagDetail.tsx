import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ChevronLeft, Search } from 'lucide-react';
import { unwrapList, getResourceTags } from '../utils/resourceHelpers';

export function meta({ params }: { params: { tagId?: string } }) {
  const rawTag = params.tagId ? decodeURIComponent(params.tagId) : "Tag";
  const title = rawTag.charAt(0).toUpperCase() + rawTag.slice(1);
  return [{ title: `${title} Resources - GOAT Guide` }];
}

interface Resource {
  id: number;
  resource_name: string;
  description: string;
  keywords?: string | null;
  tags?: string[] | null;
  location: string | null;
}

export default function TagDetail() {
  const { tagId } = useParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const currentTag = decodeURIComponent(tagId || '').toLowerCase();
  const displayTitle = currentTag.charAt(0).toUpperCase() + currentTag.slice(1);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/resources')
      .then(res => res.json())
      .then((json) => {
        if (isMounted) {
          setResources(unwrapList<Resource>(json));
          setLoading(false);
        }
      })
      .catch(err => { 
        console.error(err); 
        if (isMounted) setLoading(false); 
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Match resources whose tags contain this tag
  const filteredResources = resources.filter(r =>
    getResourceTags(r).map(t => t.toLowerCase()).includes(currentTag)
  );

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <div className="hero-section">
        <div className="container-main">
          <button className="flex items-center text-gray-300 hover:text-white mb-6 font-medium" onClick={() => window.history.back()}>
            <ChevronLeft className="w-5 h-5 mr-1" /><span className="text-lg">Back</span>
          </button>
          <div className="text-center">
            <h1 className="hero-title-large">
              <span className="text-[#EDB920]">{displayTitle}</span> Resources
            </h1>
            <p className="hero-subtitle">Explore all resources related to {displayTitle}.</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-gray-50 py-16 px-4 relative z-0">
        <div className="container-main">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : filteredResources.length > 0 ? (
            <>
              <h4 className="section-heading">Found {filteredResources.length} Resource{filteredResources.length !== 1 ? 's' : ''}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredResources.map((resource) => (
                  <Link key={resource.id} to={`/resource/${resource.id}`} className="card-resource block">
                    <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
                    <h3 className="text-xl font-semibold mb-2">{resource.resource_name}</h3>
                    <p className="text-sm text-gray-300 line-clamp-2">{resource.description}</p>
                    {resource.location && <p className="text-xs text-gray-400 mt-2">{resource.location}</p>}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="bg-white p-8 rounded-xl shadow-lg inline-block">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#192E56] mb-2">No Resources Found</h2>
                <p className="text-gray-600 mb-6">No resources are tagged with "{displayTitle}".</p>
                <Link to="/resources" className="btn-primary">Browse All Resources</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
