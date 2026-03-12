import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ChevronLeft, Mail, Instagram, Youtube, Link as LinkIcon,
  BookOpen, Monitor, Users, Coffee, Archive, PenTool, Video,
  Headphones, Theater, SquareLibrary, Puzzle, Globe, Phone
} from 'lucide-react';

export function meta() {
  return [{ title: "Department - GOAT Guide" }];
}

// Map icon name strings (stored in DB) to actual Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  Mail, Instagram, Youtube, Link: LinkIcon, BookOpen, Monitor, Users,
  Coffee, Archive, PenTool, Video, Headphones, Theater, SquareLibrary,
  Puzzle, Globe, Phone,
};

const resolveIcon = (name: string): React.ElementType => ICON_MAP[name] || Globe;

interface ContactInfo {
  label: string;
  value: string;
  link?: string;
  icon: string; // icon name string from DB
}

interface SectionItem {
  name: string;
  items: string[];
}

interface Section {
  title: string;
  icon: string; // icon name string from DB
  items: string[];
  subCategories?: SectionItem[];
}

interface DepartmentData {
  title: string;
  description: string;
  contactInfo: ContactInfo[];
  sections: Section[];
}

export default function DepartmentDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.departmentId;

  const [data, setData] = useState<DepartmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/departments/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch department:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

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
      {/* Hero Section */}
      <div className="bg-[#0F2E6A] text-white pt-15 pb-16 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button className="flex items-center text-gray-300 hover:text-white transition-colors mb-6" onClick={() => window.history.back()}>
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-lg font-medium">Back</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{data.title}</h1>
              <p className="text-lg text-gray-300 max-w-3xl leading-relaxed">{data.description}</p>
            </div>

            {/* Quick contact icon links */}
            <div className="flex gap-4 flex-wrap">
              {data.contactInfo.map((info, idx) => {
                const Icon = resolveIcon(info.icon);
                return (
                  <a
                    key={idx}
                    href={info.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-[#192E56] rounded-full hover:bg-[#EDB920] hover:text-[#0F2E6A] transition-all duration-300 border border-gray-600 hover:border-transparent text-white"
                    title={info.label}
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {data.sections.map((section, index) => {
            const SectionIcon = resolveIcon(section.icon);
            return (
              <div key={index} className="bg-[#192E56] rounded-xl shadow-xl overflow-hidden border border-gray-700 text-gray-100 hover:scale-[1.01] transition-transform duration-300">
                <div className="p-6 border-b border-gray-600 bg-[#142444] flex items-center gap-3">
                  <div className="p-2 bg-[#0F2E6A] rounded-lg text-[#EDB920]">
                    <SectionIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{section.title}</h3>
                </div>
                <div className="p-6 space-y-4">
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
                  {section.subCategories?.map((sub, i) => (
                    <div key={i} className="mt-4">
                      <h4 className="text-[#EDB920] font-semibold text-sm uppercase tracking-wide mb-2">{sub.name}</h4>
                      <ul className="space-y-1 ml-1">
                        {sub.items.map((subItem, j) => (
                          <li key={j} className="text-sm text-gray-300 pl-2 border-l-2 border-gray-600">{subItem}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Contact Info Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
              <div className="p-2 bg-gray-200 rounded-lg text-[#0F2E6A]">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F2E6A]">Contact Info</h3>
            </div>
            <div className="p-6 space-y-4">
              {data.contactInfo.map((info, idx) => {
                const Icon = resolveIcon(info.icon);
                return (
                  <a key={idx} href={info.link} target="_blank" rel="noreferrer" className="flex items-center p-3 rounded-lg hover:bg-blue-50 group transition-colors">
                    <Icon className="w-5 h-5 text-gray-500 group-hover:text-[#0F2E6A] mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">{info.label}</p>
                      <p className="text-[#0F2E6A] font-medium">{info.value}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
