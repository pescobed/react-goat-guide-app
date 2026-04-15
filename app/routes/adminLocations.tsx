import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ChevronLeft, MapPin, Plus, Trash2, ExternalLink } from "lucide-react";

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [newLoc, setNewLoc] = useState({ name: "", map_url: "" });
  const adminPassword = "SeuADMINGOATupdates!@26";

  useEffect(() => {
    fetch("/api/locations").then(res => res.json()).then(setLocations);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
      body: JSON.stringify(newLoc)
    });
    setNewLoc({ name: "", map_url: "" });
    fetch("/api/locations").then(res => res.json()).then(setLocations);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/admin" className="flex items-center text-gray-500 mb-6"><ChevronLeft /> Dashboard</Link>
        <h1 className="text-3xl font-black text-[#0F2E6A] mb-8 flex items-center gap-2">
          <MapPin className="text-[#EDB920]" /> Campus Locations
        </h1>

        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 space-y-4">
          <h2 className="font-bold text-gray-700">Add Building/Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Building Name (e.g. Student Union)" 
              className="p-3 border rounded-lg outline-none focus:border-[#EDB920]"
              value={newLoc.name}
              onChange={(e) => setNewLoc({...newLoc, name: e.target.value})}
            />
            <input 
              placeholder="Google Maps URL (Optional)" 
              className="p-3 border rounded-lg outline-none focus:border-[#EDB920]"
              value={newLoc.map_url}
              onChange={(e) => setNewLoc({...newLoc, map_url: e.target.value})}
            />
          </div>
          <button className="w-full bg-[#EDB920] text-[#0F2E6A] font-black py-3 rounded-lg flex items-center justify-center gap-2 uppercase tracking-widest">
            <Plus size={20}/> Register Location
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-bold text-gray-600">Name</th>
                <th className="p-4 font-bold text-gray-600">Map Link</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc: any) => (
                <tr key={loc.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-semibold text-[#0F2E6A]">{loc.name}</td>
                  <td className="p-4">
                    {loc.map_url && (
                      <a href={loc.map_url} target="_blank" className="text-blue-500 flex items-center gap-1 text-sm underline">
                        View Map <ExternalLink size={12}/>
                      </a>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}