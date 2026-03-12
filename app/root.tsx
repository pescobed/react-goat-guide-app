import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { Menu, X, Home, BookOpen, Search, ChevronDown, Building2 } from 'lucide-react';

import { use, useState, useEffect } from "react";
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  
  { rel: "icon", href: "/goat.svg", type: "image/svg+xml" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(false); // New state for dropdown

  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  
  const toggleDepartments = () => setIsDepartmentsOpen(!isDepartmentsOpen);

  // List of Departments
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch('http://138.68.7.157:5000/api/departments')
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error("Error fetching departments:", err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ------------------------
          GLOBAL STICKY HEADER
      ------------------------ */}
      <header className="sticky top-0 bg-white shadow-sm z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          
          {/* Logo - Clickable to go Home */}
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <h1 className="text-xl font-bold text-gray-800">The GOAT Guide</h1>
          </Link>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            {location.pathname !== "/" && (
              <Link 
                to="/" // Clicking this takes you back to the Home page to search
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Go to Search"
              >
                 <Search className="w-5 h-5" />
              </Link>
            )}

            <button 
              onClick={toggleMenu} 
              aria-label="Open Menu"
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------
          SLIDE-OUT MENU OVERLAY
      ------------------------ */}
      {/* Dark background overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
          onClick={closeMenu} 
        />
      )}

      {/* Slide-out Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
        <div className="p-5">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-gray-800">Menu</h2>
            <button onClick={closeMenu} className="p-1 text-gray-500 hover:text-red-500 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col space-y-2">
            {/* Home Link */}
            <Link 
              to="/" 
              onClick={closeMenu}
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 font-medium p-3 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>

            {/* About Link */}
            <Link 
              to="/about" 
              onClick={closeMenu}
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 font-medium p-3 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>About the Guide</span>
            </Link>

            {/* DEPARTMENTS DROPDOWN */}
            <div>
              <button 
                onClick={toggleDepartments}
                className="w-full flex items-center justify-between text-gray-700 hover:text-blue-600 font-medium p-3 hover:bg-blue-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5" />
                  <span>Departments</span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${isDepartmentsOpen ? 'rotate-180' : ''}`} 
                />
              </button>

             {/* Dropdown List */}
              {isDepartmentsOpen && (
                <div className="ml-4 mt-1 border-l-2 border-blue-100 pl-2 space-y-1">
                  {departments.map((dept) => (
                    <Link
                      key={dept.id} // Use the unique ID from your database
                      // Assuming your department route expects the ID or Name
                      to={`/department/${dept.id}`} 
                      onClick={closeMenu}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      {dept.name}
                    </Link>
                  ))}
                </div>
              )} 
            </div>
          </nav>
        </div>
      </div>

      {/* ------------------------
          MAIN PAGE CONTENT
      ------------------------ */}
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}