import type { Route } from "./+types/home";
import { Search, ChevronUp, BookOpen, Users, FlaskConical, GraduationCap, BrainCircuit, HeartPulse, Palette, Lightbulb } from 'lucide-react'; // Importing icons

export function meta({}: Route.MetaArgs) {
  return [
    { title: "The GOAT Guide Home" },
    { name: "description", content: "Welcome to a comprehensive SEU resource guide!" },
  ];
}

interface TagButtonProps {
  children: React.ReactNode;
}

interface ResourceCardProps {
  title: string;
  description: string;
  colorClass: string;
}

// Reusable Components
const TagButton: React.FC<TagButtonProps> = ({ children }) => (
  <button className="px-4 py-2 text-sm rounded-full border border-gray-400 text-gray-200 hover:border-white hover:text-white transition-colors duration-200 whitespace-nowrap">
    {children}
  </button>
);

const ResourceCard: React.FC<ResourceCardProps> = ({ title, description, colorClass }) => (
  <div className={`relative p-6 bg-slate-800 rounded-lg shadow-xl text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
    {/* Colored top border effect */}
    <div className={`absolute top-0 left-0 w-full h-1 ${colorClass}`}></div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-300">{description}</p>
  </div>
);

export default function Home() {
  const tags = [
    "Physical Wellness", "Rec Well", "Exercise", "Academic", "Tutoring",
    "Emotional Wellness", "Career", "Parking", "Mental Health", "Therapy",
    "Writing", "Involvement", "Professionalism", "Clubs", "Events",
    "Library", "Food Support", "Parking Permits", "The Huddle", "Volunteer", "Service"
  ];

  const popularResources = [
    { title: "The Writing Center", description: "Personalized writing support", color: "bg-yellow-500" },
    { title: "The Huddle", description: "Free food, clothes, and other essentials", color: "bg-blue-500" },
    { title: "Wellness Kits", description: "Free wellness kits for your needs", color: "bg-emerald-500" },
    { title: "Counseling", description: "Learn about counseling services", color: "bg-purple-500" },
    { title: "The Math Lab", description: "Free math tutoring", color: "bg-orange-500" },
    { title: "Research Assistance", description: "Get help with your research", color: "bg-rose-500" },
    { title: "Computer Labs", description: "Find locations with computer access", color: "bg-cyan-500" },
    { title: "SafeWalk SEU", description: "Get around campus safely", color: "bg-pink-500" },
  ];

  // Function to scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    // Outer container for the whole page content
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900 dark:text-gray-100">
      {/* Tailwind CSS CDN script - IMPORTANT for live previews */}
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          .font-sans {
            font-family: 'Inter', sans-serif;
          }
          /* Custom scrollbar for better aesthetics */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>

      {/* Hero Section (Dark Blue Background) */}
      <div className="bg-slate-900 text-white pb-20 pt-8 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Left Logo/Header */}
          <header className="mb-12">
            <h1 className="text-xl font-bold">The GOAT Guide</h1>
          </header>

          {/* Main Hero Content - Centered */}
          <main className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">The GOAT Guide</h2>
            <h3 className="text-xl md:text-2xl text-gray-300 font-medium max-w-2xl mx-auto">
              The student resource hub for your needs
            </h3>

            {/* Search Bar */}
            <div className="flex justify-center mt-10">
              <div className="w-full max-w-2xl flex items-center bg-white rounded-full p-2 shadow-xl">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full bg-transparent border-none focus:ring-0 p-2 text-gray-800 placeholder-gray-500 text-lg"
                />
                <button aria-label="Search" className="p-3 text-gray-600 hover:text-gray-900 transition-colors">
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </div>
          </main>

          {/* Tag Buttons Section */}
          <section className="mt-12">
            <div className="flex flex-wrap justify-center gap-3">
              {tags.map((tag, index) => (
                <TagButton key={index}>{tag}</TagButton>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* "Explore Popular Resources" Section (White Background) */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 relative z-0">
        <div className="mx-auto max-w-7xl">
          <h4 className="text-3xl font-extrabold text-gray-900 mb-10 text-center md:text-left">
            Explore Popular Resources
          </h4>

          {/* Resource Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularResources.map((resource, index) => (
              <ResourceCard
                key={index}
                title={resource.title}
                description={resource.description}
                colorClass={resource.color} // Pass the Tailwind color class
              />
            ))}
          </div>
        </div>
      </div>

      {/* "Not sure where to start?" Sticky Footer */}
      <footer className="sticky bottom-0 bg-blue-100 py-4 text-blue-800 text-center text-lg font-medium shadow-md border-t border-blue-200 z-20">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p>Not sure where to start?</p>
          <p className="text-base text-blue-700">Use the tags at the top to find resources that match your needs</p>
          <button
            onClick={scrollToTop}
            className="mt-3 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
}