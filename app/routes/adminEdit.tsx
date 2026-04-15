import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, Save, Lock, LayoutGrid, MapPin, Phone } from "lucide-react";

const ADMIN_PASSWORD = "SeuADMINGOATupdates!@26";

export default function AdminEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id) && id !== "add-resource";

  const [loading, setLoading] = useState(isEditing); // only load if editing
  const [password, setPassword] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

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
    department_id: "",
  });

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) navigate("/admin-login");
  }, []);

  useEffect(() => {
    // Always fetch departments for the dropdown
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error("Dept Fetch Error:", err));

    // Only fetch existing resource data when editing
    if (isEditing) {
      fetch(`/api/resources/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            resource_name: data.resource_name || "",
            description: data.description || "",
            location: data.location || "",
            keywords: data.keywords || "",
            phone: data.phone || "",
            email: data.email || "",
            socials: data.socials || "",
            hours: data.hours || "",
            cta_link: data.cta_link || "",
            department_id: data.department_id ? String(data.department_id) : "",
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error("Resource Fetch Error:", err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = isEditing ? `/api/resources/${id}` : `/api/resources`;
    const method = isEditing ? "PUT" : "POST";
    const token = localStorage.getItem("admin_token");

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-admin-password": password,
        },
        body: JSON.stringify({
          ...formData,
          department_id: formData.department_id || null,
        }),
      });

      if (response.status === 401) {
        alert("Unauthorized: Incorrect admin password or expired session.");
      } else if (response.ok) {
        alert(isEditing ? "Resource updated successfully!" : "New resource created!");
        navigate("/admin");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Could not save resource."}`);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Connection error: Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#EDB920] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#0F2E6A] font-bold">Loading resource...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#0F2E6A] text-white py-8 mb-8 shadow-md">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            to="/admin"
            className="flex items-center text-blue-200 hover:text-white mb-4 transition-colors text-sm font-semibold"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black">
                {isEditing ? "Edit Resource" : "Add New Resource"}
              </h1>
              <p className="text-blue-300 text-sm mt-1 uppercase tracking-wider font-semibold">
                {isEditing ? `Database ID: ${id}` : "Creating a new entry"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSave} className="space-y-6">

          {/* Section: Categorization */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-5 border-b pb-3">
              <LayoutGrid className="w-5 h-5 text-[#EDB920]" />
              <h2 className="text-lg font-black text-gray-800">Categorization & Info</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-1.5">
                  Resource Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none transition-colors"
                  value={formData.resource_name}
                  onChange={handleChange("resource_name")}
                  required
                  placeholder="e.g. Math Tutoring Center"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1.5">Assign Department</label>
                <select
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none bg-white transition-colors"
                  value={formData.department_id}
                  onChange={handleChange("department_id")}
                >
                  <option value="">— No Department Assigned —</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1.5">Keywords</label>
                <input
                  type="text"
                  placeholder="e.g. Tutoring, Math, Free, STEM..."
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none transition-colors"
                  value={formData.keywords}
                  onChange={handleChange("keywords")}
                />
                <p className="text-xs text-gray-400 mt-1">Comma-separated. Used for search and Tags page.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-1.5">Description</label>
                <textarea
                  rows={4}
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none resize-y transition-colors"
                  value={formData.description}
                  onChange={handleChange("description")}
                  placeholder="Describe what this resource does and who it helps..."
                />
              </div>
            </div>
          </div>

          {/* Section: Location & Contact */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-5 border-b pb-3">
              <MapPin className="w-5 h-5 text-[#EDB920]" />
              <h2 className="text-lg font-black text-gray-800">Location & Contact</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1.5">Physical Location</label>
                <input
                  type="text"
                  placeholder="e.g. Student Union Room 201"
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none transition-colors"
                  value={formData.location}
                  onChange={handleChange("location")}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1.5">Hours of Operation</label>
                <input
                  type="text"
                  placeholder="e.g. Mon–Fri 9am–5pm"
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none transition-colors"
                  value={formData.hours}
                  onChange={handleChange("hours")}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1.5">Phone</label>
                <input
                  type="text"
                  placeholder="(512) 555-1234"
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none transition-colors"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="contact@school.edu"
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none transition-colors"
                  value={formData.email}
                  onChange={handleChange("email")}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-1.5">Website / CTA Link</label>
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none transition-colors"
                  value={formData.cta_link}
                  onChange={handleChange("cta_link")}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-1.5">Social Media Links</label>
                <input
                  type="text"
                  placeholder="Instagram, Twitter, Facebook URLs (comma-separated or JSON)"
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none transition-colors"
                  value={formData.socials}
                  onChange={handleChange("socials")}
                />
              </div>
            </div>
          </div>

          {/* Authorization Footer */}
          <div className="bg-[#0F2E6A] p-8 rounded-xl border-t-8 border-[#EDB920] shadow-xl text-white">
            <div className="flex items-center gap-2 mb-5">
              <Lock className="w-6 h-6 text-[#EDB920]" />
              <h2 className="text-xl font-black italic uppercase">
                {isEditing ? "Push Update" : "Create Resource"}
              </h2>
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
                disabled={saving}
                className="bg-[#EDB920] hover:bg-yellow-400 disabled:opacity-60 text-[#0F2E6A] px-10 py-4 rounded-lg font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? "Saving..." : isEditing ? "Update Database" : "Create Resource"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}