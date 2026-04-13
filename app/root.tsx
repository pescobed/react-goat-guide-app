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
import { Menu, X, Home, BookOpen, Search, Building2, MapPin, Lock } from 'lucide-react';
import { useState } from "react";
import type { Route } from "./+types/root";
import "./app.css";
import { MessageSquarePlus } from "lucide-react"; 

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
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col">

      {/* GLOBAL STICKY HEADER */}
      <header className="sticky top-0 bg-white shadow-sm z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <h1 className="text-xl font-bold text-gray-800">The GOAT Guide</h1>
          </Link>

          <div className="flex items-center gap-4">
            {location.pathname !== "/" && (
              <Link
                to="/"
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

      {/* OVERLAY */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      {/* SLIDE-OUT SIDEBAR */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-gray-800">Menu</h2>
            <button onClick={closeMenu} className="p-1 text-gray-500 hover:text-red-500 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Wrapper for Nav Links - flex-grow pushes everything else down */}
          <nav className="flex flex-col space-y-2 flex-grow">
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 font-medium p-3 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>

            <Link
              to="/departments"
              onClick={closeMenu}
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 font-medium p-3 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Building2 className="w-5 h-5" />
              <span>Departments</span>
            </Link>

            <Link
              to="/locations"
              onClick={closeMenu}
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 font-medium p-3 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <MapPin className="w-5 h-5" />
              <span>View All Locations</span>
            </Link>

            <Link
              to="/about"
              onClick={closeMenu}
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 font-medium p-3 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>About the Guide</span>
            </Link>

            <Link 
              to="/suggest" 
              onClick={closeMenu} 
              className="flex items-center space-x-3 text-gray-700 hover:text-[#0F2E6A] font-medium p-3 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <MessageSquarePlus className="w-5 h-5 text-[#EDB920]" />
              <span>Suggest an Update</span>
            </Link>
          </nav>

          {/* ADMIN LOGIN */}
          <div className="mt-auto pt-4 pb-2">
            <div className="border-t border-gray-100 mb-4" /> 
            <Link
              to="/admin-login"
              onClick={closeMenu}
              className="flex items-center justify-center space-x-2 text-gray-400 hover:text-gray-600 text-xs font-semibold py-3 px-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all uppercase tracking-widest"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="grow">
        <Outlet />
      </main>

      <footer className="bg-white border-t py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">© 2026 GOAT Guide </p>
          <Link to="/suggest" className="text-[#0F2E6A] text-xs font-bold hover:underline mt-2 inline-block">
            Notice a mistake? Suggest an update here.
          </Link>
        </div>
      </footer>

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