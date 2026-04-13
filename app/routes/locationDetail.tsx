import { useParams, Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { 
  ChevronLeft, 
  MapPin, 
  ChevronRight, 
  Clock, 
  Phone, 
  Mail, 
  ExternalLink 
} from "lucide-react";

export default function LocationDetail() {
  const { locationName } = useParams();
  const navigate = useNavigate();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((r: any) => {
          if (locationName === "Off-Campus") {
            // Matches locations starting with numbers (addresses)
            return /^\d/.test(r.location || "");
          }
          return r.location === locationName;
        });
        setResources(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [locationName]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-lg">Loading...</p>
    </div>
  );

  const displayName = locationName === "Off-Campus" ? "Off-Campus Resources" : locationName;

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      
      {/* Hero Section*/}
      <div className="bg-[#0F2E6A] text-white pt-12 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button 
            className="flex items-center text-gray-300 hover:text-white transition-colors mb-6" 
            onClick={() => navigate('/locations')}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-lg font-medium">Back to Locations</span>
          </button>
          <div className="flex items-center gap-4">
             <MapPin className="w-10 h-10 text-[#EDB920]" />
             <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
               {displayName}
             </h1>
          </div>
          <p className="text-gray-300 mt-3">
            {resources.length} resource{resources.length !== 1 ? 's' : ''} discovered
          </p>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {resources.length === 0 ? (
          <div className="text-center py-20 text-gray-500 border border-dashed border-gray-300 rounded-xl bg-white">
            <p className="text-xl">No resources found for this location.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <div 
                key={res.id} 
                className="bg-[#192E56] rounded-xl shadow-xl overflow-hidden text-white border border-gray-700 hover:scale-[1.01] transition-transform duration-300 flex flex-col"
              >
                
                {/* Card Header */}
                <div className="p-5 border-b border-gray-600 bg-[#142444]">
                  <h3 className="text-lg font-bold">{res.resource_name}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {res.location || "Location not listed"}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col grow">
                  <p className="text-sm text-gray-300 leading-relaxed mb-4 grow line-clamp-3">
                    {res.description}
                  </p>

                  {/* Contact snippets */}
                  <div className="space-y-1 text-xs text-gray-400 mb-4">
                    {res.hours && (
                      <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {res.hours}</p>
                    )}
                    {res.phone && (
                      <a href={`tel:${res.phone}`} className="flex items-center gap-1 hover:text-white">
                        <Phone className="w-3 h-3" /> {res.phone}
                      </a>
                    )}
                    {res.email && (
                      <a href={`mailto:${res.email}`} className="flex items-center gap-1 hover:text-white">
                        <Mail className="w-3 h-3" /> {res.email}
                      </a>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      to={`/resource/${res.id}`}
                      className="text-xs px-3 py-1.5 rounded-full border border-[#EDB920] text-[#EDB920] hover:bg-[#EDB920] hover:text-[#0F2E6A] transition-colors font-medium"
                    >
                      View Details
                    </Link>
                    {res.cta_link && (
                      <a
                        href={res.cta_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 rounded-full bg-yellow-400 text-slate-900 hover:bg-yellow-500 transition-colors font-medium flex items-center gap-1"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}