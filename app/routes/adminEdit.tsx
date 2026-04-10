import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, Save, Lock } from "lucide-react";

export default function AdminEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
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
    department_id: ""
  });

  // Load the current data from your MySQL backend
  useEffect(() => {
    fetch(`/api/resources/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching resource:", err);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(`/api/resources/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password 
      },
      body: JSON.stringify(formData)
    });

    if (response.status === 401) {
      alert("Incorrect admin password!");
    } else if (response.ok) {
      alert("Resource updated successfully!");
      navigate(`/resource/${id}`);
    } else {
      alert("💥 Error: Could not update resource.");
    }
  };

  if (loading) return <div className="p-20 text-center">Loading Resource Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#0F2E6A] text-white py-8 mb-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link to={`/resource/${id}`} className="flex items-center text-gray-300 hover:text-white mb-4">
            <ChevronLeft className="w-5 h-5" /> Back to Resource
          </Link>
          <h1 className="text-3xl font-bold">Edit: {formData.resource_name}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section: Basic Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name</label>
                <input 
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#EDB920] outline-none"
                  value={formData.resource_name}
                  onChange={(e) => setFormData({...formData, resource_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={4}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#EDB920] outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Section: Contact & Details */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Location & Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location / Room #</label>
                <input 
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#EDB920] outline-none"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#EDB920] outline-none"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#EDB920] outline-none"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (Comma separated)</label>
                <input 
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#EDB920] outline-none"
                  value={formData.keywords || ''}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Section: Extra Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">External Links & Hours</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours of Operation</label>
                <input 
                  type="text"
                  placeholder="e.g. Mon-Fri: 8am-5pm"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#EDB920] outline-none"
                  value={formData.hours || ''}
                  onChange={(e) => setFormData({...formData, hours: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call-to-Action Link (Website)</label>
                <input 
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#EDB920] outline-none"
                  value={formData.cta_link || ''}
                  onChange={(e) => setFormData({...formData, cta_link: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Security Footer */}
          <div className="bg-red-50 p-8 rounded-xl border-2 border-red-200 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-red-700">
              <Lock className="w-6 h-6" />
              <h2 className="text-xl font-bold">Save Authorization</h2>
            </div>
            <p className="text-red-600 mb-4 text-sm font-medium">
              A valid admin secret key is required to commit these changes directly to the MySQL database.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="password"
                placeholder="Enter Admin Secret Key"
                className="flex-grow p-4 border-2 border-red-200 rounded-lg focus:border-red-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="submit"
                className="bg-[#0F2E6A] hover:bg-black text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Save className="w-5 h-5" /> Save All Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}