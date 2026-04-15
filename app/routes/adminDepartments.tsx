import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ChevronLeft, Building2, Plus, Trash2 } from "lucide-react";

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState("");
  const token = localStorage.getItem("admin_token");

  const fetchDepts = () => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then(setDepartments);
  };

  useEffect(() => { fetchDepts(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ name: newDept }),
    });
    if (res.ok) {
      setNewDept("");
      fetchDepts();
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white min-h-screen">
      <Link to="/admin" className="flex items-center text-gray-500 mb-6 hover:text-[#0F2E6A]">
        <ChevronLeft size={20} /> Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-black text-[#0F2E6A] mb-8 flex items-center gap-2">
        <Building2 className="text-[#EDB920]" /> Departments
      </h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-8">
        <input 
          className="grow p-3 border-2 rounded-xl outline-none focus:border-[#EDB920]" 
          placeholder="New Department Name"
          value={newDept}
          onChange={(e) => setNewDept(e.target.value)}
          required
        />
        <button className="bg-[#0F2E6A] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors">
          <Plus size={20}/> Add
        </button>
      </form>

      <div className="space-y-3">
        {departments.map((dept: any) => (
          <div key={dept.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-all">
            <span className="font-bold text-gray-700">{dept.name}</span>
            <div className="text-xs text-gray-400 mr-auto ml-4">{dept.resource_count || 0} Resources</div>
            {/* Action buttons could go here */}
          </div>
        ))}
      </div>
    </div>
  );
}