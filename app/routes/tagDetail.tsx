import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ChevronLeft, Search } from 'lucide-react';

export function meta({ params }: { params: { tagId: string } }) {
  const title = params.tagId ? params.tagId.charAt(0).toUpperCase() + params.tagId.slice(1) : "Tag";
  return [{ title: `${title} Resources - GOAT Guide` }];
}

interface Resource {
  id: number;
  slug: string;
  title: string;
  description: string;
  color: string;
  tags: string[];
}

const ResourceCard = ({ title, description, colorClass, linkTo }: { title: string; description: string; colorClass: string; linkTo: string }) => (
  <Link to={linkTo} className="card-resource">
    <div className={`absolute top-0 left-0 w-full h-1 ${colorClass}`}></div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-300">{description}</p>
  </Link>
);

export default function TagDetail() {
  const { tagId } = useParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const currentTag = tagId?.toLowerCase() || "";
  const displayTitle = currentTag.charAt(0).toUpperCase() + currentTag.slice(1);

  useEffect(() => {
    fetch('/api/resources')
      .then(res => res.json())
      .then((data: Resource[]) => {
        setResources(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch resources:", err);
        setLoading(false);
      });
  }, []);

  const filteredResources = resources.filter(r =>
    r.tags.some(t => t.toLowerCase() === currentTag)
  );

  return (
    <div className="page-wrapper">
      <div className="hero-section">
        <div className="container-main">
          <button className="flex items-center text-gray-300 hover:text-white mb-4 font-medium" onClick={() => window.history.back()}>
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

      <div className="bg-gray-50 py-16 px-4 relative z-0">
        <div className="container-main">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : filteredResources.length > 0 ? (
            <>
              <h4 className="section-heading">Found {filteredResources.length} Resources</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    title={resource.title}
                    description={resource.description}
                    colorClass={resource.color}
                    linkTo={`/resource/${resource.slug}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="bg-white p-8 rounded-xl shadow-lg inline-block">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#192E56] mb-2">No Resources Found</h2>
                <p className="text-gray-600 mb-6">We couldn't find any resources tagged with "{displayTitle}".</p>
                <Link to="/" className="btn-primary">Browse All Resources</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
