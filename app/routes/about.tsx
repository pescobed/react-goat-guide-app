import React from 'react';
import { Link } from 'react-router';
import { 
  Building2, Home, Search, HeartHandshake, CheckCircle, Lightbulb, UserCheck
} from 'lucide-react';

export function meta() {
  return [
    { title: "About The GOAT Guide" },
    { name: "description", content: "Learn about the purpose and features of this student resource hub." },
  ];
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-[#EDB920]">
    <div className="p-3 bg-[#0F2E6A] text-[#EDB920] rounded-full w-fit mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {/* Tailwind CSS CDN (Ensure consistency) */}
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); .font-sans { font-family: 'Inter', sans-serif; }`}
      </style>

      {/* Hero Section (Navy/Yellow Theme) */}
      <div className="bg-[#0F2E6A] text-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#EDB920] mb-4">
            About The GOAT Guide
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
            Your comprehensive, centralized student resource hub for everything at St. Edward's University.
          </p>
        </div>
      </div>

      {/* Main Content: Mission and Value */}
      <div className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-12">
            
            {/* Mission Statement */}
            <div className="lg:col-span-2 mb-10 lg:mb-0">
              <h2 className="text-3xl font-bold text-[#192E56] mb-4 border-b-2 border-[#EDB920] pb-2 w-fit">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                The primary goal of The GOAT Guide is to cut through the noise and provide students with a single, reliable source for accessing crucial campus resources and departmental information. We aim to empower every student to easily find the support they need—whether it's academic, wellness-related, or administrative.
              </p>
              
              <h3 className="text-2xl font-semibold text-[#192E56] mb-4">
                What does 'GOAT' stand for?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                While we certainly think our resources are the Greatest Of All Time, GOAT stands for **Guide to Official Access and Tools**. It reflects our commitment to being the definitive source for official university information and services.
              </p>
            </div>

            {/* Call to Action Card */}
            <div className="lg:col-span-1 p-6 bg-[#C3E3F6] rounded-xl border border-blue-200 shadow-md">
              <UserCheck className="w-8 h-8 text-[#0F2E6A] mb-3" />
              <h3 className="text-xl font-bold text-[#0F2E6A] mb-3">
                Need Help Now?
              </h3>
              <p className="text-gray-700 mb-4">
                Don't wait! Jump back to the homepage to search for the specific service you require.
              </p>
              <Link 
                to="/" 
                className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-bold rounded-lg shadow-sm text-white bg-[#0F2E6A] hover:bg-blue-800 transition duration-300"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section: How It Works */}
      <div className="py-16 bg-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#192E56] mb-10 text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Search}
              title="Quick Search"
              description="Instantly find resources by keywords, department name, or common need (e.g., 'tutoring' or 'parking')."
            />
            <FeatureCard 
              icon={Building2}
              title="Department Directory"
              description="Browse the full list of campus departments, each with dedicated pages detailing their structure and services."
            />
            <FeatureCard 
              icon={Lightbulb}
              title="Tag Navigation"
              description="Use intuitive tags on the homepage to explore resources based on broad categories like 'Wellness' or 'Academic'."
            />
            <FeatureCard 
              icon={CheckCircle}
              title="Verified Information"
              description="All resource details, contact info, and links are regularly verified to ensure accuracy."
            />
          </div>
        </div>
      </div>
    </div>
  );
}