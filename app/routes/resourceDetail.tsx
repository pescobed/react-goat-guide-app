import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { ChevronLeft, ExternalLink, Mail, MapPin, Instagram, Globe, Phone, Link as LinkIcon } from 'lucide-react';

// Map icon name strings from DB to Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  Mail, MapPin, Instagram, Globe, Phone, Link: LinkIcon, ExternalLink,
};
const resolveIcon = (name: string): React.ElementType => ICON_MAP[name] || Globe;

interface ContactItem {
  label: string;
  value: string;
  link?: string;
  icon: string; // name string from DB
}

interface ResourceDetailData {
  title: string;
  description: string;
  services: string[];
  contactInfo: ContactItem[];
  tags: string[];
  scheduleLink: string;
}

const TagButton = ({ children }: { children: React.ReactNode }) => (
  <button className="px-4 py-2 text-sm rounded-full bg-[#0F2E6A] border-2 border-[#EDB920] text-gray-200 hover:border-white hover:text-white transition-colors duration-200 whitespace-nowrap">
    {children}
  </button>
);

const ResourceDetail: React.FC = () => {
  const params = useParams();
  const slug = params.resourceId || "unknown";

  const [data, setData] = useState<ResourceDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/resources/${slug}`)          // ← relative path, no hardcoded IP
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch resource:", err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  if (!data) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-3xl font-extrabold text-gray-900">Resource Not Found</h2>
        <p className="text-gray-600 mt-2">The resource you are looking for does not exist yet.</p>
        <button onClick={() => window.history.back()} className="mt-4 px-4 py-2 bg-[#0F2E6A] text-white rounded hover:bg-blue-700">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900">
      {/* Hero */}
      <div className="bg-[#C3E3F6] border-t pt-15 border-b border-blue-200 py-12 md:py-20 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button className="flex items-center text-[#0F2E6A] font-medium mb-6 hover:text-indigo-900 transition-colors" onClick={() => window.history.back()}>
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-lg">Back</span>
          </button>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-4xl">
            {data.title}
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Description + Services */}
          <div className="lg:col-span-2 pr-8 border-r border-gray-200">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">{data.description}</p>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">They offer:</h3>
            <ul className="space-y-3 list-none p-0 ml-4 mb-10">
              {data.services.map((service, index) => (
                <li key={index} className="flex items-start text-gray-700">
                  <span className="text-[#0F2E6A] mr-2 text-xl leading-none font-bold">&bull;</span>
                  {service}
                </li>
              ))}
            </ul>

            {data.scheduleLink && (
              <a
                href={data.scheduleLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-lg shadow-lg text-slate-900 bg-yellow-400 hover:bg-yellow-500 transition duration-300 transform hover:scale-[1.02] mt-6"
              >
                Schedule an Appointment
                <ExternalLink className="w-5 h-5 ml-2" />
              </a>
            )}
          </div>

          {/* Right: Contact Info */}
          <div className="lg:col-span-1 pl-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Contact & Location</h3>
            <div className="space-y-6">
              {data.contactInfo.map((item, index) => {
                const Icon = resolveIcon(item.icon);
                return (
                  <div key={index} className="border-l-4 border-[#0F2E6A] pl-4 py-1">
                    <p className="text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </p>
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[#0F2E6A] hover:text-indigo-800 underline text-lg font-medium transition-colors break-all">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-gray-800 text-lg font-medium">{item.value}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tag Bar */}
      <div className="bg-[#C3E3F6] py-6 border-t border-blue-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-3">
          {data.tags.map((tag, index) => (
            <TagButton key={index}>{tag}</TagButton>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;
