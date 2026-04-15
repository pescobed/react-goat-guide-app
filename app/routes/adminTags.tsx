import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ChevronLeft, Tag, Plus, Trash2, Hash } from "lucide-react";

export default function AdminTags() {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const adminPassword = "SeuADMINGOATupdates!@26"; // Or fetch from state

  useEffect(() => {
    fetch("/api/tags").then(res => res.json()).then(setTags);
  }, []);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
      body: JSON.stringify({ name: newTagName })
    });
    if (res.ok) {
      setNewTagName("");
      // Refresh list
      fetch("/api/tags").then(res => res.json()).then(setTags);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this tag? It will be removed from all resources.")) return;
    await fetch(`/api/tags/${id}`, { 
        method: "DELETE", 
        headers: { "x-admin-password": adminPassword } 
    });
    setTags(tags.filter((t: any) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/admin" className="flex items-center text-gray-500 mb-6"><ChevronLeft /> Dashboard</Link>
        <h1 className="text-3xl font-black text-[#0F2E6A] mb-8 flex items-center gap-2">
          <Tag className="text-[#EDB920]" /> Tag Manager
        </h1>

        {/* Add New Tag */}
        <form onSubmit={handleAddTag} className="flex gap-2 mb-8 bg-white p-4 rounded-xl shadow-sm">
          <input 
            className="grow p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#EDB920]" 
            placeholder="New Tag Name (e.g. Wellness)"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <button className="bg-[#0F2E6A] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2">
            <Plus size={20}/> Add
          </button>
        </form>

        {/* Tag List */}
        <div className="grid gap-2">
          {tags.map((t: any) => (
            <div key={t.id} className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-100 group">
              <div className="flex items-center gap-3">
                <Hash className="text-gray-300" size={18} />
                <span className="font-bold text-gray-700">{t.name}</span>
              </div>
              <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}