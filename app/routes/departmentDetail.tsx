import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ChevronLeft, Mail, Instagram, Youtube, Link as LinkIcon, 
  BookOpen, Monitor, Users, Coffee, Archive, PenTool, Video, 
  Headphones, Theater, SquareLibrary, Puzzle
} from 'lucide-react';

export function meta() {
  return [
    { title: "Munday Library - GOAT Guide" },
    { name: "description", content: "Department details for Munday Library at SEU." },
  ];
}

// ---------------------------
// DATA TYPES
// ---------------------------
interface ListSection {
  title: string;
  icon: React.ElementType;
  items: string[];
  subCategories?: { name: string; items: string[] }[];
}

interface DepartmentData {
  title: string;
  description: string;
  contactInfo: { label: string; value: string; link?: string; icon: React.ElementType }[];
  sections: ListSection[];
}

// ---------------------------
// MOCK DATA
// ---------------------------
const mockDepartmentData: Record<string, DepartmentData> = {
  "munday-library": {
    title: "Munday Library",
    description: "The Munday Library provides access to a little less than 1.5 million resources including newspapers, ebooks, physical books, audio books, streaming media, databases, and special collections.",
    
    contactInfo: [
      { icon: Mail, label: "Email", value: "library@stedwards.edu", link: "mailto:library@stedwards.edu" },
      { icon: LinkIcon, label: "Canvas", value: "Munday Library Canvas", link: "https://bit.ly/MundayLibraryCanvas" },
      { icon: LinkIcon, label: "Research Help", value: "Research Help", link: "https://bit.ly/MundayResearchHelp" },
      { icon: Instagram, label: "Instagram", value: "@seulibrary", link: "https://instagram.com/seulibrary" },
      { icon: Youtube, label: "YouTube", value: "@SEUlibrary", link: "https://youtube.com/@SEUlibrary" },
    ],

    sections: [
      {
        title: "Collections",
        icon: BookOpen,
        items: ["Physical & Digital Books", "Newspapers & Journals", "Databases", "Special Collections"],
        subCategories: [
          { name: "Ebooks & Journals", items: ["Ebook Central", "Ebscohost", "OverDrive", "JSTOR", "Project Muse"] },
          { name: "Videos", items: ["Kanopy", "Swank", "Docuseek", "Films on Demand", "Academic Video Online"] },
          { name: "Audiobooks & Graphic Novels", items: ["OverDrive", "ComicsPlus"] },
          { name: "Performance", items: ["Digital Theatre +"] }
        ]
      },
      {
        title: "Spaces & Facilities",
        icon: SquareLibrary,
        items: [
          "Study Rooms (Reservable)",
          "Lounge/Information Commons",
          "Periodicals Area",
          "Archives (Historical Docs & Memorabilia)",
          "Puzzles & Board Game Collection"
        ]
      },
      {
        title: "Technology & Labs",
        icon: Monitor,
        items: ["Computer Lab", "Printing", "Scanning"],
        subCategories: [
          { name: "Digital Media Center (DMC)", items: ["Multimedia production rooms", "Supports digital media creation"] },
          { name: "Media Checkout", items: ["Cameras", "Recorders", "Tripods"] }
        ]
      },
      {
        title: "Services & Support",
        icon: Users,
        items: [],
        subCategories: [
          { name: "Research Assistance", items: ["In-person", "Zoom", "Email", "Phone"] },
          { name: "Writing Center", items: ["Support for all writing projects", "One-on-one tutoring"] },
          { name: "Instruction", items: ["Canvas course integration", "Library Innovation Lab"] }
        ]
      },
      {
        title: "Programs & Clubs",
        icon: Puzzle,
        items: [],
        subCategories: [
          { name: "Passive Programs", items: ["Board games & Jigsaw puzzles", "Finals Activities", "Pumpkin painting", "Holiday displays"] },
          { name: "Student Organizations", items: ["Board Game Club", "Chess Club", "Creative Writers Club"] }
        ]
      }
    ]
  }
};

// ---------------------------
// COMPONENT
// ---------------------------
export default function DepartmentDetail() {
  const params = useParams();
  const navigate = useNavigate();
  
  // Default to 'munday-library' if no param, or use the URL param
  const slug = params.departmentId || "munday-library";
  const data = mockDepartmentData[slug];

  // Handle Not Found
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-3xl font-bold text-[#0F2E6A]">Department Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
       {/* Tailwind CSS CDN (Ensure consistency) */}
       <script src="https://cdn.tailwindcss.com"></script>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); .font-sans { font-family: 'Inter', sans-serif; }`}
      </style>

      {/* Hero Section (Navy Background) */}
      <div className="bg-[#0F2E6A] text-white pt-15 pb-16 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button 
            className="flex items-center text-gray-300 hover:text-white transition-colors mb-6"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-lg font-medium">Back</span>
          </button>

          {/* Header Content */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{data.title}</h1>
              <p className="text-lg text-gray-300 max-w-3xl leading-relaxed">
                {data.description}
              </p>
            </div>
            
            {/* Contact Links - Quick Access */}
            <div className="flex gap-4 flex-wrap">
              {data.contactInfo.map((info, idx) => (
                <a 
                  key={idx} 
                  href={info.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 bg-[#192E56] rounded-full hover:bg-[#EDB920] hover:text-[#0F2E6A] transition-all duration-300 border border-gray-600 hover:border-transparent"
                  title={info.label}
                >
                  <info.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Map through sections */}
          {data.sections.map((section, index) => (
            <div 
              key={index} 
              className="bg-[#192E56] rounded-xl shadow-xl overflow-hidden border border-gray-700 text-gray-100 hover:scale-[1.01] transition-transform duration-300"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-600 bg-[#142444] flex items-center gap-3">
                <div className="p-2 bg-[#0F2E6A] rounded-lg text-[#EDB920]">
                  <section.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{section.title}</h3>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                {/* Standard Items */}
                {section.items.length > 0 && (
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start text-sm">
                        <span className="text-[#EDB920] mr-2 font-bold">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Sub Categories */}
                {section.subCategories?.map((sub, i) => (
                  <div key={i} className="mt-4">
                    <h4 className="text-[#EDB920] font-semibold text-sm uppercase tracking-wide mb-2">{sub.name}</h4>
                    <ul className="space-y-1 ml-1">
                      {sub.items.map((subItem, j) => (
                        <li key={j} className="text-sm text-gray-300 pl-2 border-l-2 border-gray-600">
                          {subItem}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Contact Info Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
              <div className="p-2 bg-gray-200 rounded-lg text-[#0F2E6A]">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F2E6A]">Contact Info</h3>
            </div>
            <div className="p-6 space-y-4">
              {data.contactInfo.map((info, idx) => (
                <a 
                  key={idx}
                  href={info.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center p-3 rounded-lg hover:bg-blue-50 group transition-colors"
                >
                  <info.icon className="w-5 h-5 text-gray-500 group-hover:text-[#0F2E6A] mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">{info.label}</p>
                    <p className="text-[#0F2E6A] font-medium">{info.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}