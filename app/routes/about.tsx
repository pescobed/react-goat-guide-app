import React from 'react';
import { Link } from 'react-router';
import { 
  Building2, Home, Search, CheckCircle, Lightbulb, UserCheck, 
  TrendingUp, Users, GraduationCap, ShieldCheck, Code2, Palette
} from 'lucide-react';

export function meta() {
  return [
    { title: "About The GOAT Guide | St. Edward's University" },
    { name: "description", content: "Bridging the gap between campus resources and student success through the GOAT framework." },
  ];
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, color = "#0F2E6A" }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-[#EDB920]">
    <div className={`p-3 rounded-full w-fit mb-4`} style={{ backgroundColor: color, color: '#EDB920' }}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </div>
);

export default function About() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased text-gray-900">
      {/* 1. Hero Section: The Identity */}
      <div className="bg-[#0F2E6A] text-white py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#EDB920] mb-6 tracking-tight">
            The GOAT Guide
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 leading-relaxed font-light">
            Bridging the gap between campus support and student success at St. Edward's University.
          </p>
        </div>
      </div>

      {/* 2. Mission & Origin: The "Why" */}
      <div className="py-20 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#0F2E6A] mb-6">Our Mission</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Developed as a Computer Science senior thesis, this project began in a 15-week <strong>Design Thinking</strong> course. We discovered that Hilltoppers do not lack resources, but a gap in <strong>awareness</strong> of them.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                The GOAT Guide provides a technical foundation to ensure no student is left unaware of the support available to them.
              </p>
            </div>
            <div className="bg-[#0F2E6A] p-8 rounded-2xl shadow-xl transform md:rotate-2">
              <Code2 className="w-12 h-12 text-[#EDB920] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Student-Led </h3>
              <p className="text-blue-100">Built by students who navigate these halls every day, ensuring the G.O.A.T. Guide stays relevant to the actual needs of the SEU community.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The GOAT Framework: The "How" (Collapsible) */}
      <div className="py-20 bg-[#C3E3F6]">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#0F2E6A] mb-4">The G.O.A.T. Framework</h2>
            <p className="text-gray-500 uppercase tracking-widest font-semibold">Grow • Outreach • Achieve • Thrive</p>
          </div>
          
          <div className="space-y-4">
            {[
              { letter: 'G', label: 'Grow', icon: TrendingUp, desc: 'Personal & Professional Development: Resources that help you evolve beyond the classroom through career prep and leadership.' },
              { letter: 'O', label: 'Outreach', icon: Users, desc: 'Community & Connections: Navigating your relationship with the world, student orgs, and local involvement.' },
              { letter: 'A', label: 'Achieve', icon: GraduationCap, desc: 'Academic Excellence: Finding the specific technical tools and tutoring needed to excel in your specific major.' },
              { letter: 'T', label: 'Thrive', icon: ShieldCheck, desc: 'Wellness & Balance: Mental health, physical safety, and the stability every Hilltopper needs to stay focused.' }
            ].map((item, idx) => (
              <details key={idx} className="group border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-[#EDB920] transition-colors">
                <summary className="flex items-center justify-between p-6 cursor-pointer bg-white list-none">
                  <div className="flex items-center gap-5">
                    <span className="text-3xl font-black text-[#EDB920] w-8">{item.letter}</span>
                    <span className="text-xl font-bold text-[#0F2E6A]">{item.label}</span>
                  </div>
                  <item.icon className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 pt-2 text-gray-600 leading-relaxed text-lg border-t border-gray-50 bg-gray-50">
                  {item.desc}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Features: The "What" */}
      <div className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-center text-[#0F2E6A] mb-12">Designed for Efficiency</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={Search} title="Quick Search" description="Find resources by keywords like 'tutoring' or 'parking'." />
            <FeatureCard icon={Building2} title="Directory" description="Full list of departments with verified contact info." />
            <FeatureCard icon={Lightbulb} title="Tag Discovery" description="Browse by needs like 'wellness' or 'financial'." />
            <FeatureCard icon={CheckCircle} title="Verified" description="Data is regularly checked for accuracy and dead links." />
          </div>
        </div>
      </div>

      {/* 5. Final Call to Action */}
      <div className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="bg-[#C3E3F6] rounded-3xl p-12 text-center shadow-inner">
            <h2 className="text-3xl font-bold text-[#0F2E6A] mb-4">Ready to find what you need?</h2>
            <p className="text-lg text-gray-700 mb-8 max-w-xl mx-auto">
              The GOAT Guide is constantly evolving. Jump back to the home page to start your search.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center px-8 py-4 bg-[#0F2E6A] text-white font-bold rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              <Home className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
