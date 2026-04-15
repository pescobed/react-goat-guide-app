import { useEffect, useState } from "react";
import { Link } from "react-router"; // or 'react-router-dom' depending on your version
import SearchBar from '../components/searchBar'; 
import { MessageSquare, Edit3, Building2, PlusCircle, CheckCircle, Trash2, BarChart3 } from "lucide-react";

export default function AdminSelect() {
  const [resources, setResources] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState({ totalResources: 0, totalSuggestions: 0, totalViews: 0 });
  const [searchTerm, setSearchTerm] = useState("");

  // Get token from storage (assuming you save it on login)
  const token = localStorage.getItem('admin_token'); 

  useEffect(() => {
    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch the "Higher View" list
      const resData = await fetch("/api/admin/all", { headers }).then(res => res.json());
      setResources(resData);

      // 2. Fetch Suggestions
      const sugData = await fetch("/api/suggestions", { headers }).then(res => res.json());
      setSuggestions(sugData);

      // 3. Fetch Stats for the header
      const statsData = await fetch("/api/admin/stats", { headers }).then(res => res.json());
      setStats(statsData);
    };

    fetchData();
  }, [token]);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/resource/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setResources(resources.filter((r: any) => r.id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const filteredResources = resources.filter((r: any) =>
    (r.resource_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 bg-white min-h-screen">
      
      {/* --- HEADER & STATS --- */}
      <div className="bg-[#0F2E6A] p-8 rounded-2xl text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
            <div className="flex gap-4 mt-2 text-blue-200 text-sm">
               <span className="flex items-center gap-1"><BarChart3 size={14}/> {stats.totalViews} Total Views</span>
               <span className="flex items-center gap-1"><Building2 size={14}/> {stats.totalResources} Resources</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/departments" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-xl font-bold transition-all">
              <Building2 className="w-5 h-5 text-[#EDB920]" /> Departments
            </Link>
            <Link to="/admin/tags" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-xl font-bold transition-all">
              Tags
            </Link>
            <Link to="/admin/locations" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-xl font-bold transition-all">
              Locations
            </Link>
            <Link to="/admin/add-resource" className="flex items-center gap-2 bg-[#EDB920] text-[#0F2E6A] px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform shadow-md">
              <PlusCircle className="w-5 h-5" /> Add New
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search all records..." />
          
          <div className="grid gap-3">
            {filteredResources.map((r: any) => (
              <div key={r.id} className={`p-4 bg-white border-2 rounded-xl flex justify-between items-center group transition-all ${!r.resource_name ? 'border-red-200' : 'border-gray-100 hover:border-[#EDB920]'}`}>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-2.5 rounded-lg text-[#0F2E6A]">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{r.resource_name || <span className="text-red-500 italic">Unnamed Record</span>}</h4>
                    <p className="text-xs text-gray-400">ID: {r.id} • Views: {r.view_count}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link to={`/admin/edit/${r.id}`} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                    <Edit3 className="w-5 h-5" />
                  </Link>
                  <button onClick={() => handleDelete(r.id, r.resource_name)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- SUGGESTIONS SIDEBAR --- */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-[#EDB920]" /> Inbox ({suggestions.length})
          </h3>
          {suggestions.map((s: any) => (
            <div key={s.id} className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl relative">
              <h4 className="font-bold text-[#0F2E6A] text-sm">{s.resource_name}</h4>
              <p className="text-xs text-gray-600 mt-2 italic">"{s.description}"</p>
              <Link to={`/admin/review/${s.id}`} className="mt-4 block text-center bg-[#0F2E6A] text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-800">
                Review
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}