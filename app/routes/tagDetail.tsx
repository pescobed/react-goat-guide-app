import React from 'react';
import { useParams, Link } from 'react-router';
import { ChevronLeft, Search } from 'lucide-react';

export function meta({ params }: { params: { tagId: string } }) {
  // Capitalize the tag for the title (e.g. "tutoring" -> "Tutoring")
  const title = params.tagId ? params.tagId.charAt(0).toUpperCase() + params.tagId.slice(1) : "Tag";
  return [{ title: `${title} Resources - GOAT Guide` }];
}

// Define what a Resource looks like
interface Resource {
  title: string;
  description: string;
  color: string;
  slug: string;
  tags: string[]; // Added tags list to each resource
}

// --------------------------------------
// MASTER RESOURCE LIST
// This is where we define which resources belong to which tags.
// --------------------------------------
const allResources: Resource[] = [
  { 
    title: "The Writing Center", 
    description: "Personalized writing support for papers and projects.", 
    color: "bg-yellow-500", 
    slug: "the-writing-center",
    tags: ["Writing", "Tutoring", "Academic"] 
  },
  { 
    title: "The Math Lab", 
    description: "Free math tutoring and homework help.", 
    color: "bg-orange-500", 
    slug: "the-math-lab", // You'll need to make this resource page later if you haven't!
    tags: ["Math", "Tutoring", "Academic"]
  },
  { 
    title: "The Huddle", 
    description: "Free food, clothes, and other essentials.", 
    color: "bg-blue-500", 
    slug: "the-huddle",
    tags: ["Food Support", "Wellness", "Essentials"]
  },
  { 
    title: "Wellness Kits", 
    description: "Free wellness kits for your needs.", 
    color: "bg-emerald-500", 
    slug: "wellness-kits",
    tags: ["Wellness", "Health"]
  },
  { 
    title: "Counseling", 
    description: "Learn about counseling services.", 
    color: "bg-purple-500", 
    slug: "counseling",
    tags: ["Mental Health", "Wellness"]
  },
  { 
    title: "Research Assistance", 
    description: "Get help with your research.", 
    color: "bg-rose-500", 
    slug: "research-assistance",
    tags: ["Academic", "Library", "Research"]
  },
];

// Reusing your ResourceCard style using app.css classes
const ResourceCard = ({ title, description, colorClass, linkTo }: { title: string, description: string, colorClass: string, linkTo: string }) => (
  <Link to={linkTo} className="card-resource">
    <div className={`absolute top-0 left-0 w-full h-1 ${colorClass}`}></div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-300">{description}</p>
  </Link>
);

export default function TagDetail() {
  const { tagId } = useParams();
  
  // 1. Normalize the tag from the URL (e.g., "Tutoring" or "tutoring" -> "tutoring")
  const currentTag = tagId?.toLowerCase() || "";

  // 2. Filter resources that have this tag
  const filteredResources = allResources.filter(resource => 
    resource.tags.some(t => t.toLowerCase() === currentTag)
  );

  // Capitalize for display
  const displayTitle = currentTag.charAt(0).toUpperCase() + currentTag.slice(1);

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container-main">
          <button className="btn-back text-gray-300 hover:text-white mb-4" onClick={() => window.history.back()}>
            <ChevronLeft className="w-5 h-5 mr-1" /><span className="text-lg">Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="hero-title-large">
              <span className="text-[#EDB920]">{displayTitle}</span> Resources
            </h1>
            <p className="hero-subtitle">
              Explore all resources related to {displayTitle}.
            </p>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="bg-gray-50 py-16 px-4 relative z-0">
        <div className="container-main">
          {filteredResources.length > 0 ? (
            <>
               <h4 className="section-heading">Found {filteredResources.length} Resources</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredResources.map((resource, index) => (
                  <ResourceCard 
                    key={index} 
                    title={resource.title} 
                    description={resource.description} 
                    colorClass={resource.color} 
                    linkTo={`/resource/${resource.slug}`} 
                  />
                ))}
              </div>
            </>
          ) : (
            // Fallback if no resources match the tag
            <div className="text-center py-20">
               <div className="bg-white p-8 rounded-xl shadow-lg inline-block">
                 <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                 <h2 className="text-2xl font-bold text-[#192E56] mb-2">No Resources Found</h2>
                 <p className="text-gray-600 mb-6">We couldn't find any resources tagged with "{displayTitle}".</p>
                 <Link to="/" className="btn-primary bg-[#0F2E6A] text-white hover:bg-blue-800 shadow-none border-none">
                   Browse All Resources
                 </Link>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}