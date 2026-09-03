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
  socials: string | null;
  hours: string | null;
  cta_link: string | null;
  keywords: string | null;
}

interface DepartmentData {
  id: number;
  name: string;
  resources: Resource[];
}

export function meta() {
  return [{ title: "Department - GOAT Guide" }];
}

export default function DepartmentDetail() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<DepartmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/departments/${departmentId}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(json => { 
        if (isMounted) {
          setData(json); 
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
  }, [departmentId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-lg">Loading...</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h2 className="text-3xl font-bold text-[#0F2E6A]">Department Not Found</h2>
      <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 underline">Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">

      {/* Hero */}
      <div className="bg-[#0F2E6A] text-white pt-12 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button className="flex items-center text-gray-300 hover:text-white transition-colors mb-6" onClick={() => window.history.back()}>
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-lg font-medium">Back</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{data.name}</h1>
          <p className="text-gray-300 mt-3">{data.resources.length} resource{data.resources.length !== 1 ? 's' : ''} available</p>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {data.resources.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">No resources listed for this department yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.resources.map((resource) => (
              <div key={resource.id} className="bg-[#192E56] rounded-xl shadow-xl overflow-hidden text-white border border-gray-700 hover:scale-[1.01] transition-transform duration-300 flex flex-col">
                
                {/* Card Header */}
                <div className="p-5 border-b border-gray-600 bg-[#142444]">
                  <h3 className="text-lg font-bold">{resource.resource_name}</h3>
                  {resource.location && (
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {resource.location}
                    </p>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col grow">
                  <p className="text-sm text-gray-300 leading-relaxed mb-4 grow line-clamp-3">
                    {resource.description}
                  </p>

                  {/* Contact snippets */}
                  <div className="space-y-1 text-xs text-gray-400 mb-4">
                    {resource.hours && (
                      <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {resource.hours}</p>
                    )}
                    {resource.phone && (
                      <a href={`tel:${resource.phone}`} className="flex items-center gap-1 hover:text-white">
                        <Phone className="w-3 h-3" /> {resource.phone}
                      </a>
                    )}
                    {resource.email && (
                      <a href={`mailto:${resource.email}`} className="flex items-center gap-1 hover:text-white">
                        <Mail className="w-3 h-3" /> {resource.email}
                      </a>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      to={`/resource/${resource.id}`}
                      className="text-xs px-3 py-1.5 rounded-full border border-[#EDB920] text-[#EDB920] hover:bg-[#EDB920] hover:text-[#0F2E6A] transition-colors font-medium"
                    >
                      View Details
                    </Link>
                    {resource.cta_link && (
                      <a
                        href={resource.cta_link}
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