import { useEffect, useState } from "react";
import { Link } from "react-router";
// Import your custom SearchBar
import SearchBar from '../components/searchBar'; 
import { MessageSquare, Edit3, Building2, PlusCircle, CheckCircle } from "lucide-react";

export default function AdminSelect() {
  const [resources, setResources] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch live resources
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => setResources(data));

    // Fetch pending feedback/suggestions
    fetch("/api/suggestions")
      .then((res) => res.json())
      .then((data) => setSuggestions(data));
  }, []);

  // Filter resources based on the search term
  const filteredResources = resources.filter((r: any) =>
    r.resource_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.location && r.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 bg-white min-h-screen">
      
      {/* --- HEADER & ACTIONS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#0F2E6A] p-8 rounded-2xl text-white shadow-lg">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
          <p className="text-blue-200 mt-1 font-medium">Moderation & Resource Management</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link 
            to="/admin/departments" 
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-xl font-bold transition-all"
          >
            <Building2 className="w-5 h-5 text-[#EDB920]" /> Departments
          </Link>
          <Link 
            to="/admin/add-resource" 
            className="flex items-center gap-2 bg-[#EDB920] text-[#0F2E6A] px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform shadow-md"
          >
            <PlusCircle className="w-5 h-5" /> Add New
          </Link>
        </div>
      </div>

      {/* --- SEARCH SECTION --- */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Search Directory</h2>
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Filter by name or location..." 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT SIDE: LIVE RESOURCES (2/3 width) --- */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-xl font-bold text-gray-800">Live Resources</h3>
            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">
              {filteredResources.length} Total
            </span>
          </div>
          
          <div className="grid gap-3">
            {filteredResources.length > 0 ? (
              filteredResources.map((r: any) => (
                <Link 
                  key={r.id} 
                  to={`/admin/edit/${r.id}`}
                  className="p-4 bg-white border border-gray-200 rounded-xl hover:border-[#EDB920] hover:shadow-md transition-all flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-2.5 rounded-lg text-[#0F2E6A] group-hover:bg-[#EDB920] transition-colors">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 group-hover:text-[#0F2E6A]">{r.resource_name}</span>
                      <p className="text-xs text-gray-400 mt-0.5">Dept ID: {r.department_id || 'Unassigned'}</p>
                    </div>
                  </div>
                  <span className="text-gray-300 group-hover:text-[#EDB920] group-hover:translate-x-1 transition-all">→</span>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed text-gray-400">
                No resources found.
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT SIDE: SUGGESTIONS (1/3 width) --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <MessageSquare className="text-[#EDB920] w-5 h-5" />
            <h3 className="text-xl font-bold text-gray-800">Suggestions</h3>
          </div>

          {suggestions.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <CheckCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">Inbox is empty!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((s: any) => (
                <div key={s.id} className="p-5 bg-[#C3E3F6]/30 border border-blue-100 rounded-2xl shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#0F2E6A]"></div>
                  <h4 className="font-bold text-[#0F2E6A] text-sm">{s.resource_name}</h4>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed italic">"{s.description}"</p>
                  <Link 
                    to={`/admin/review/${s.id}`}
                    className="mt-4 block text-center bg-[#0F2E6A] text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Review Suggestion
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}