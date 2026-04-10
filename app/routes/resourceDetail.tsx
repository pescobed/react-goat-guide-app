import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ChevronLeft, ExternalLink, Mail, MapPin, Phone, Globe, Clock, Tag } from 'lucide-react';

interface Resource {
  id: number;
  resource_name: string;
  description: string;
  location: string | null;
  keywords: string | null;
  phone: string | null;
  email: string | null;
  socials: string | null;
  hours: string | null;
  cta_link: string | null;
  department_id: number | null;
}

const ResourceDetail: React.FC = () => {
  const { resourceId } = useParams();
  const [data, setData] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/resources/${resourceId}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(json => { setData(json); setLoading(false); 
        fetch(`/api/resources/${resourceId}/view`, { method: 'PATCH' });
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [resourceId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-lg">Loading...</p>
    </div>
  );

  if (!data) return (
    <div className="text-center py-20 px-4">
      <h2 className="text-3xl font-extrabold text-gray-900">Resource Not Found</h2>
      <p className="text-gray-600 mt-2">The resource you are looking for does not exist.</p>
      <button onClick={() => window.history.back()} className="mt-4 px-4 py-2 bg-[#0F2E6A] text-white rounded hover:bg-blue-700">
        Go Back
      </button>
    </div>
  );

  // Parse keywords into tag array
  const tags = (data.keywords || '').split(',').map(k => k.trim()).filter(Boolean);

  // Build contact info rows from whatever columns are populated
  const contactItems = [
    data.location && { icon: MapPin, label: 'Location', value: data.location, link: undefined },
    data.phone    && { icon: Phone,  label: 'Phone',    value: data.phone,    link: `tel:${data.phone}` },
    data.email    && { icon: Mail,   label: 'Email',    value: data.email,    link: `mailto:${data.email}` },
    data.socials  && { icon: Globe,  label: 'Socials',  value: data.socials,  link: data.socials.startsWith('http') ? data.socials : undefined },
    data.hours    && { icon: Clock,  label: 'Hours',    value: data.hours,    link: undefined },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string; link?: string }[];

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900">

      {/* Hero Banner */}
      <div className="bg-[#C3E3F6] border-t border-b border-blue-200 py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            className="flex items-center text-[#0F2E6A] font-medium mb-6 hover:text-indigo-900 transition-colors"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-lg">Back</span>
          </button>

          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-4xl">
            {data.resource_name}
          </h2>

          {data.location && (
            <p className="mt-3 text-lg text-slate-600 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> {data.location}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Description */}
          <div className="lg:col-span-2 pr-0 lg:pr-8 border-r-0 lg:border-r border-gray-200">
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">{data.description}</p>

            {/* CTA Button */}
            {data.cta_link && (
              <a
                href={data.cta_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-bold rounded-lg shadow-lg text-slate-900 bg-yellow-400 hover:bg-yellow-500 transition duration-300 transform hover:scale-[1.02]"
              >
                Learn More / Schedule
                <ExternalLink className="w-5 h-5 ml-2" />
              </a>
            )}
          </div>

          {/* Right: Contact Info */}
          <div className="lg:col-span-1 lg:pl-8 mt-8 lg:mt-0">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Contact & Info</h3>
            {contactItems.length > 0 ? (
              <div className="space-y-5">
                {contactItems.map((item, index) => (
                  <div key={index} className="border-l-4 border-[#0F2E6A] pl-4 py-1">
                    <p className="text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </p>
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[#0F2E6A] hover:text-indigo-800 underline text-base font-medium break-all">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-gray-800 text-base font-medium">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No contact info available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Tag Bar */}
      {tags.length > 0 && (
        <div className="bg-[#C3E3F6] py-6 border-t border-blue-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3">
              {tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                  className="px-4 py-2 text-sm rounded-full bg-[#0F2E6A] border-2 border-[#EDB920] text-gray-200 hover:border-white hover:text-white transition-colors duration-200"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDetail;
