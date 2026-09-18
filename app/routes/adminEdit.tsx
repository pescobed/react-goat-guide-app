import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router";
import { ChevronLeft, LayoutGrid, MapPin, CheckCircle } from "lucide-react";
import { adminFetch } from "../utils/api";

export default function AdminEdit() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEditing = Boolean(id) && id !== "add-resource";

  const [loading, setLoading] = useState(isEditing);
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

  useEffect(() => {
    // Reset form data if navigating from edit mode to add mode
    if (!isEditing) {
      setFormData({
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
      setLoading(false);
    }

    // Fetch departments for the dropdown
    adminFetch("/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Dept Fetch Error:", err));

    // Handle suggestion promotion (pre-filling form from suggestion data)
    if (!isEditing && location.state?.suggestionData) {
      const sug = location.state.suggestionData;
      setFormData({
        resource_name: sug.resource_name || "",
        description: sug.description || "",
        location: sug.location || "",
        keywords: sug.keywords || "",
        phone: sug.phone || "",
        email: sug.email || "",
        socials: "",
        hours: sug.hours || "",
        cta_link: sug.cta_link || "",
        department_id: "",
      });
      if (sug.department_name) {
        alert("Note: User suggested Department: " + sug.department_name + "\nPlease select the correct department from the dropdown.");
      }
    }

    // Fetch existing resource data if in Edit mode
    if (isEditing) {
      setLoading(true);
      adminFetch(`/api/resources/${id}`)
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
        })
        .catch((err) => {
          console.error("Resource Fetch Error:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, location.state]);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = isEditing ? `/api/resources/${id}` : `/api/resources`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await adminFetch(url, {
        method,
        body: JSON.stringify({
          ...formData,
          department_id: formData.department_id || null,
        }),
      });

      if (response.ok) {
        alert(isEditing ? "Resource updated successfully!" : "New resource created!");
        navigate("/admin");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Could not save resource."}`);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#EDB920] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#0F2E6A] font-bold">Loading resource...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/admin"
          className="flex items-center text-gray-500 hover:text-[#0F2E6A] mb-6 transition-colors text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#0F2E6A]">
            {isEditing ? "Edit Resource" : "Add New Resource"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing ? `Database ID: ${id}` : "Creating a new entry"}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
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
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
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
                <p className="text-xs text-gray-400 mt-1">Comma-separated keywords for search and tags.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-1.5">Description</label>
                <textarea
                  rows={4}
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none resize-y transition-colors"
                  value={formData.description}
                  onChange={handleChange("description")}
                  placeholder="Describe the resource and its benefits..."
                />
              </div>
            </div>
          </div>

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
                  placeholder="Instagram, Twitter, Facebook URLs"
                  className="w-full p-3 border-2 rounded-lg focus:border-[#EDB920] outline-none transition-colors"
                  value={formData.socials}
                  onChange={handleChange("socials")}
                />
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">
                Ensure all required fields (Name, Description, Tags) are filled to publish.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-[#0F2E6A] hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-blue-900/20 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    {isEditing ? "Update Resource" : "Create Resource"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}