import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ChevronLeft, MapPin, Phone, Mail, Clock } from 'lucide-react';

interface Resource {
  id: number;
  resource_name: string;
  description: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  hours: string | null;
}

export default function LocationDetail() {
  const { locationName } = useParams();
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/resources`)
      .then(res => res.json())
      .then(data => {
        let filtered;
        // Grouped filtering: If user clicked "Off-Campus", show all numeric addresses
        if (locationName === "Off-Campus") {
          filtered = data.filter((r: Resource) => /^\d/.test(r.location || ''));
        } else {
          filtered = data.filter((r: Resource) => r.location === locationName);
        }
        setResources(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [locationName]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <div className="bg-[#0F2E6A] text-white pt-12 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button className="flex items-center text-gray-300 hover:text-white mb-6" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-lg">Back</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#EDB920] rounded-lg text-[#0F2E6A]">
              <MapPin className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{locationName}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Link key={resource.id} to={`/resource/${resource.id}`} className="block h-full group">
              <div className="bg-[#192E56] p-6 rounded-xl shadow-lg text-white border border-transparent group-hover:border-[#EDB920] transition-all h-full flex flex-col">
                <h3 className="text-xl font-bold mb-2">{resource.resource_name}</h3>
                <p className="text-sm text-gray-300 line-clamp-3 mb-4 grow">{resource.description}</p>
                <div className="text-xs text-gray-400 space-y-1">
                    {resource.location && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {resource.location}</p>}
                    {resource.hours && <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {resource.hours}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}