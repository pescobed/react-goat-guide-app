import React from 'react';
import { useParams } from 'react-router';
import { Search, ChevronLeft, ExternalLink, Mail, MapPin, Instagram } from 'lucide-react';

export function meta() {
  return [
    { title: "The Writing Center - GOAT Guide" },
    { name: "description", content: "Details and contact information for The Writing Center at SEU." },
  ];
}

interface ContactItem {
  icon: React.ElementType;
  label: string;
  value: string;
  link?: string;
}

interface ResourceDetailData {
  title: string;
  description: string;
  services: string[];
  contactInfo: ContactItem[];
  tags: string[];
  scheduleLink: string;
}

// ---------------------------
// MOCK DATA (Replace with API/DB Fetch)
// ---------------------------

const mockResourceDatabase: Record<string, ResourceDetailData> = {
  "the-writing-center": {
    title: "The Writing Center",
    description: "The writing center will help you at any point of the writing process. If you are looking for feedback on an essay, or even just need help starting a writing assignment, the writing center is there to support you.",
    services: [
      "In-person appointments",
      "Virtual appointments",
      "Online feedback on a draft",
      "24/7 online writing resources"
    ],
    contactInfo: [
      { icon: Mail, label: "Contact", value: "library@stedwards.edu", link: "mailto:library@stedwards.edu" },
      { icon: MapPin, label: "Location", value: "Munday Library" },
      { icon: Instagram, label: "Instagram", value: "@stedwardswriting", link: "https://instagram.com/stedwardswriting" },
    ],
    tags: ["Academic", "Tutoring", "Writing", "Library"],
    scheduleLink: "#", 
  },
  "the-huddle": {
    title: "The Huddle",
    description: "The Huddle is SEU's resource center providing free food, clothes, and essential items to students facing basic needs insecurity.",
    services: [
      "Access to the food pantry",
      "Free clothing closet",
      "Hygiene products and school supplies",
    ],
    contactInfo: [
        { icon: Mail, label: "Contact", value: "huddle@stedwards.edu", link: "mailto:huddle@stedwards.edu" },
        { icon: MapPin, label: "Location", value: "ground floor of Le Mans Hal" },
    ],
    tags: ["Food Support", "Wellness", "Essentials"],
    scheduleLink: "#", // No scheduling, but for demonstration
  }
  
};

// Component
// ---------------------------

const TagButton = ({ children }: { children: React.ReactNode }) => (
  <button className="px-4 py-2 text-sm rounded-full bg-[#0F2E6A] border-2 border-[#EDB920] text-gray-200 hover:border-white hover:text-white transition-colors duration-200 whitespace-nowrap">
    {children}
  </button>
);

const ResourceDetail: React.FC = () => {
  const params = useParams();
  const resourceId = params.resourceId;

  const slug = resourceId || "unknown";
  const data = mockResourceDatabase[slug]; 

  // Handle case where resource is not found
  if (!data) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-3xl font-extrabold text-gray-900">Resource Not Found</h2>
        <p className="text-gray-600 mt-2">
           The resource you are looking for does not exist yet.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-[#0F2E6A] text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900">
      <style>
        {`
          /* Ensures external Tailwind CSS is loaded for component styling */
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          .font-sans {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>

      {/* Hero Section (Light Blue Banner with Title) */}
      <div className="bg-[#C3E3F6] border-t pt-15 border-b border-blue-200 py-12 md:py-20 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Back Button */}
          <button 
            className="flex items-center text-[#0F2E6A] font-medium mb-6 hover:text-indigo-900 transition-colors"
            onClick={() => window.history.back()} // Simple history back for navigation
            aria-label="Go back to previous page"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-lg">Back</span>
          </button>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-4xl">
            {data.title}
          </h2>
        </div>
      </div>

      {/* Main Content Area (Description and Contact) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Description and Services */}
          <div className="lg:col-span-2 pr-8 border-r border-gray-200">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {data.description}
            </p>

            {/* Services Offered */}
            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">They offer:</h3>
            <ul className="space-y-3 list-none p-0 ml-4 mb-10">
              {data.services.map((service, index) => (
                <li key={index} className="flex items-start text-gray-700">
                  {/* Using a custom bullet point style */}
                  <span className="text-[#0F2E6A] mr-2 text-xl leading-none font-bold">&bull;</span>
                  {service}
                </li>
              ))}
            </ul>

            {/* Schedule Appointment Button */}
            <a 
              href={data.scheduleLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-lg shadow-lg text-slate-900 bg-yellow-400 hover:bg-yellow-500 transition duration-300 transform hover:scale-[1.02] mt-6"
            >
              Schedule an Appointment
              <ExternalLink className="w-5 h-5 ml-2" />
            </a>
          </div>

          {/* Right Column: Contact Information */}
          <div className="lg:col-span-1 pl-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Contact & Location</h3>
            <div className="space-y-6">
              {data.contactInfo.map((item, index) => (
                <div key={index} className="border-l-4 border-[#0F2E6A] pl-4 py-1">
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center">
                    <item.icon className="w-4 h-4 mr-2" />
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
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tag Bar (Tags) */}
      <div className="bg-[#C3E3F6] py-6 border-t border-blue-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-3">
          {data.tags.map((tag, index) => (
            <TagButton key={index}>
                {tag}
            </TagButton>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;