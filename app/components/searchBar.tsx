import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxWidth?: string; // Optional: allows you to change width per page
}

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  maxWidth = "max-w-2xl" 
}: SearchBarProps) {
  return (
    <div className={`w-full ${maxWidth} flex items-center bg-white rounded-full p-2 shadow-xl border-2 border-transparent focus-within:border-[#EDB920] transition-all`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-none focus:ring-0 p-2 ml-4 text-gray-800 placeholder-gray-500 text-lg outline-none"
      />
      
      {value ? (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      ) : (
        <div className="p-3 text-gray-400">
          <Search className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}