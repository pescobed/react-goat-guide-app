import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { ChevronLeft, Inbox, CheckCircle, Trash2, User, MessageSquare } from "lucide-react";

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/admin/suggestions")
      .then(res => res.json())
      .then(data => {
        setSuggestions(data);
        setLoading(false);
      });
  }, []);

  const handleApprove = (sug: any) => {
    // Navigate to the add-resource page and pass the suggestion data in history state
    navigate("/admin/edit/add-resource", { state: { suggestionData: sug } });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Discard this suggestion?")) return;
    const res = await fetch(`/api/suggestions/${id}`, { method: "DELETE" });
    if (res.ok) setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  if (loading) return <div className="p-10 text-center">Loading Suggestions...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0F2E6A] text-white p-8">
        <div className="max-w-6xl mx-auto">
          <Link to="/admin" className="text-blue-200 flex items-center gap-1 mb-2"><ChevronLeft size={16}/> Dashboard</Link>
          <h1 className="text-3xl font-black">User Suggestions ({suggestions.length})</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid gap-6">
        {suggestions.length === 0 && <p className="text-center py-20 text-gray-400">No pending suggestions.</p>}
        
        {suggestions.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">NEW REQUEST</span>
                <h3 className="text-xl font-bold text-[#0F2E6A]">{s.resource_name}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <p><strong>Dept:</strong> {s.department_name || "N/A"}</p>
                <p><strong>Location:</strong> {s.location || "N/A"}</p>
                <p className="col-span-2 flex items-center gap-1"><User size={14}/> {s.user_name} ({s.user_connection})</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border flex gap-3">
                <MessageSquare className="text-gray-400 shrink-0" size={18}/>
                <p className="text-sm italic text-gray-700">{s.admin_comments || "No comments provided."}</p>
              </div>
            </div>

            <div className="flex md:flex-col gap-2 justify-center shrink-0">
              <button 
                onClick={() => handleApprove(s)}
                className="bg-[#0F2E6A] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800"
              >
                <CheckCircle size={18}/> Review & Add
              </button>
              <button 
                onClick={() => handleDelete(s.id)}
                className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-100"
              >
                <Trash2 size={18}/> Discard
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}