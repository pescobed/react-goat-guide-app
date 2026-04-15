import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, Save, Lock, LayoutGrid } from "lucide-react";

export default function AdminEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [departments, setDepartments] = useState<any[]>([]); // To populate the dropdown
  
  const [formData, setFormData] = useState({
    resource_name: "",
    description: "",
    location: "",
    keywords: "",
    phone: "",
    email: "",
    socials: "",
    hours: "",
    cta_link: "",
    department_id: "" // This is key!
  });

  useEffect(() => {
    // 1. Fetch Departments
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(err => console.error("Dept Fetch Error:", err));

    // 2. Load the specific resource data ONLY if an ID exists
    if (id) {
      fetch(`/api/resources/${id}`)
        .then((res) => res.json())
        .then((data) => {
          // Fill the form with existing data
          setFormData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Resource Fetch Error:", err);
          setLoading(false);
        });
    } else {
      // 3. No ID found = "Add New" mode
      // We stop loading and leave formData as its initial empty state
      setLoading(false);
    }
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Determine if we are Updating or Creating
    const isEditing = Boolean(id);
    const url = isEditing ? `/api/resources/${id}` : `/api/resources`;
    const method = isEditing ? 'PUT' : 'POST';

    const token = localStorage.getItem("admin_token");

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
          'x-admin-password': password       
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 401) {
        alert(" Unauthorized: Incorrect admin password or expired session.");
      } else if (response.ok) {
        alert(isEditing ? " Resource updated successfully!" : " New resource created!");
        navigate(`/admin`); 
      } else {
        const errorData = await response.json();
        alert(` Error: ${errorData.error || "Could not save resource."}`);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert(" Connection error: Is the backend running?");
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-[#0F2E6A]">Loading Database Records...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#0F2E6A] text-white py-8 mb-8 shadow-md">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/admin" className="flex items-center text-blue-200 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="w-5 h-5" /> Back to Admin Dashboard
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black">Edit Resource</h1>
              <p className="text-blue-200 text-sm mt-1 uppercase tracking-wider font-semibold">Database ID: {id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section: Basic Info & Categorization */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
               <LayoutGrid className="w-5 h-5 text-[#EDB920]" />
               <h2 className="text-xl font-bold text-gray-800">Categorization & Info</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-1">Resource Name</label>
                <input 
                  type="text"
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none"
                  value={formData.resource_name || ''}
                  onChange={(e) => setFormData({...formData, resource_name: e.target.value})}
                  required
                />
              </div>

              {/* NEW: DEPARTMENT DROPDOWN */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Assign Department</label>
                <select 
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none bg-white"
                  value={formData.department_id || ""}
                  onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                >
                  <option value="">-- No Department Assigned --</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Keywords</label>
                <input 
                  type="text"
                  placeholder="Tutoring, Math, Support..."
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none"
                  value={formData.keywords || ''}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-1">Description</label>
                <textarea 
                  rows={4}
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Section: Contact & Location */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Location & Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Physical Location</label>
                <input 
                  type="text"
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Hours</label>
                <input 
                  type="text"
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none"
                  value={formData.hours || ''}
                  onChange={(e) => setFormData({...formData, hours: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Phone</label>
                <input 
                  type="text"
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Email</label>
                <input 
                  type="email"
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-1">Website / CTA Link</label>
                <input 
                  type="text"
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none"
                  value={formData.cta_link || ''}
                  onChange={(e) => setFormData({...formData, cta_link: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Authorization Footer */}
          <div className="bg-[#0F2E6A] p-8 rounded-xl border-t-8 border-[#EDB920] shadow-xl text-white">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-6 h-6 text-[#EDB920]" />
              <h2 className="text-xl font-black italic uppercase">Push to Production</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="password"
                placeholder="Enter Admin Secret Key"
                className="grow p-4 border-2 border-white/20 bg-white/10 rounded-lg focus:bg-white focus:text-black outline-none transition-all placeholder:text-blue-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="submit"
                className="bg-[#EDB920] hover:bg-yellow-500 text-[#0F2E6A] px-10 py-4 rounded-lg font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> Update Database
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}