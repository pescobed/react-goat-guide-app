import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ChevronLeft, MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

interface Resource {
  id: number;
  resource_name: string;
  description: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  hours: string | null;
  cta_link: string | null;
}

export default function LocationDetail() {
  const { locationName } = useParams(); // e.g., "Main Building"
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/locations/${encodeURIComponent(locationName || '')}`)
        .then(res => res.json())
        .then(data => { setResources(data); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });
  }, [locationName]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-[#0F2E6A] font-bold">Locating Resources...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {/* Hero Section */}
      <div className="bg-[#0F2E6A] text-white pt-12 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button 
            className="flex items-center text-gray-300 hover:text-white transition-colors mb-6" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-lg font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#EDB920] rounded-lg text-[#0F2E6A]">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                {locationName}
              </h1>
              <p className="text-gray-300 mt-2 italic">Campus Building & Hub</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Resources in this Location</h2>
        
        {resources.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-xl text-gray-500">No resources currently listed for this building.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div key={resource.id} className="bg-[#192E56] rounded-xl shadow-xl overflow-hidden text-white border border-gray-700 hover:scale-[1.01] transition-transform duration-300 flex flex-col">
                <div className="p-5 border-b border-gray-600 bg-[#142444]">
                  <h3 className="text-lg font-bold">{resource.resource_name}</h3>
                </div>

                <div className="p-5 flex flex-col grow">
                  <p className="text-sm text-gray-300 leading-relaxed mb-4 grow line-clamp-3">
                    {resource.description}
                  </p>

                  <div className="space-y-1 text-xs text-gray-400 mb-4">
                    {resource.hours && <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {resource.hours}</p>}
                    {resource.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {resource.phone}</p>}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/resource/${resource.id}`}
                      className="text-xs px-4 py-2 rounded-full border border-[#EDB920] text-[#EDB920] hover:bg-[#EDB920] hover:text-[#0F2E6A] transition-colors font-bold"
                    >
                      View Details
                    </Link>
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