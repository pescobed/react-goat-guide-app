import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  Inbox, CheckCircle, Trash2, User, MessageSquare, 
  Calendar, Mail, Phone, MapPin, Building2, Tag as TagIcon,
  Clock, Link as LinkIcon, AlertCircle, Zap
} from "lucide-react";
import AdminNav from "../components/adminNav";

type Toast = { msg: string; type: "success" | "error" } | null;

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const navigate = useNavigate();

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    setLoading(true); // Ensure loading starts
    
    fetch("/api/auth/suggestions", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => setSuggestions(data))
      .catch(err => {
        console.error(err);
        showToast("Session expired. Please login again.", "error");
      })
      .finally(() => setLoading(false)); // Always stop loading
  }, []);

  const handleEditReview = (sug: any) => {
    // Navigate to the add-resource page and pass the suggestion data
    navigate("/admin/edit/add-resource", { state: { suggestionData: sug } });
  };

  const handleQuickApprove = async (sug: any) => {
    // Check if suggestion has all required fields
    const token = localStorage.getItem("admin_token");
    const isComplete = !!(
      sug.resource_name?.trim() &&
      sug.description?.trim() &&
      sug.location?.trim()
    );

    if (!isComplete) {
      showToast("This suggestion is missing required fields. Please review and edit first.", "error");
      return;
    }

    if (!confirm(`Quick approve and publish "${sug.resource_name}"? This will create the resource immediately with the provided information.`)) {
      return;
    }

    setProcessing(sug.id);

    try {
      // Create the resource
      const createRes = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resource_name: sug.resource_name,
          description: sug.description,
          location: sug.location,
          keywords: sug.keywords || "",
          phone: sug.phone || "",
          email: sug.email || "",
          socials: "",
          hours: sug.hours || "",
          cta_link: sug.cta_link || "",
          department_id: null, // User suggested name, admin needs to assign proper ID
        }),
      });

      if (createRes.ok) {
        // Delete the suggestion
        await fetch(`/api/suggestions/${sug.id}`, { method: "DELETE" });
        
        showToast(`"${sug.resource_name}" published successfully!`, "success");
        setSuggestions(prev => prev.filter(s => s.id !== sug.id));
      } else {
        showToast("Failed to create resource.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Discard suggestion for "${name}"?`)) return;
    
    setProcessing(id);
    try {
      const res = await fetch(`/api/suggestions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuggestions(prev => prev.filter(s => s.id !== id));
        showToast("Suggestion discarded.", "success");
      } else {
        showToast("Failed to delete suggestion.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="p-10 text-center">Loading Suggestions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white font-semibold ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Admin Navigation */}
      <AdminNav />

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#0F2E6A] rounded-xl">
            <Inbox className="text-[#EDB920]" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0F2E6A]">User Suggestions</h1>
            <p className="text-sm text-gray-500">
              {suggestions.length} pending suggestion{suggestions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {suggestions.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <Inbox className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-400 font-semibold">No pending suggestions.</p>
          </div>
        )}

        {/* Suggestions Grid */}
        <div className="grid gap-6">
          {suggestions.map((sug) => {
            const isProcessing = processing === sug.id;
            const isComplete = !!(
              sug.resource_name?.trim() &&
              sug.description?.trim() &&
              sug.location?.trim()
            );

            return (
              <div 
                key={sug.id} 
                className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${
                  isComplete ? "border-green-200" : "border-yellow-200"
                }`}
              >
                {/* Header Bar */}
                <div className={`px-6 py-3 flex items-center justify-between ${
                  isComplete ? "bg-green-50" : "bg-yellow-50"
                }`}>
                  <div className="flex items-center gap-2">
                    {isComplete ? (
                      <>
                        <CheckCircle className="text-green-600" size={16} />
                        <span className="text-xs font-bold text-green-800 uppercase tracking-wider">
                          Ready to Publish
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="text-yellow-600" size={16} />
                        <span className="text-xs font-bold text-yellow-800 uppercase tracking-wider">
                          Needs Review
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    {new Date(sug.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-6">
                  {/* Resource Name */}
                  <h3 className="text-2xl font-black text-[#0F2E6A] mb-4">
                    {sug.resource_name || <span className="text-gray-400 italic">Untitled Resource</span>}
                  </h3>

                  {/* Two Column Layout */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Left Column - Resource Details */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-gray-700 uppercase tracking-wider border-b pb-2">
                        Resource Information
                      </h4>

                      {/* Department */}
                      <div className="flex items-start gap-3">
                        <Building2 className="text-[#EDB920] shrink-0 mt-0.5" size={16} />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-semibold">Department</p>
                          <p className="text-sm text-gray-800">
                            {sug.department_name || <span className="text-gray-400 italic">Not specified</span>}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-3">
                        <MapPin className="text-[#EDB920] shrink-0 mt-0.5" size={16} />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-semibold">Location</p>
                          <p className="text-sm text-gray-800">
                            {sug.location || <span className="text-gray-400 italic">Not specified</span>}
                          </p>
                        </div>
                      </div>

                      {/* Keywords */}
                      {sug.keywords && (
                        <div className="flex items-start gap-3">
                          <TagIcon className="text-[#EDB920] shrink-0 mt-0.5" size={16} />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-semibold">Keywords</p>
                            <p className="text-sm text-gray-800">{sug.keywords}</p>
                          </div>
                        </div>
                      )}

                      {/* Hours */}
                      {sug.hours && (
                        <div className="flex items-start gap-3">
                          <Clock className="text-[#EDB920] shrink-0 mt-0.5" size={16} />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-semibold">Hours</p>
                            <p className="text-sm text-gray-800">{sug.hours}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Contact & User Info */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-gray-700 uppercase tracking-wider border-b pb-2">
                        Contact & Submission Info
                      </h4>

                      {/* Phone */}
                      {sug.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="text-[#EDB920] shrink-0 mt-0.5" size={16} />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-semibold">Phone</p>
                            <p className="text-sm text-gray-800">{sug.phone}</p>
                          </div>
                        </div>
                      )}

                      {/* Email */}
                      {sug.email && (
                        <div className="flex items-start gap-3">
                          <Mail className="text-[#EDB920] shrink-0 mt-0.5" size={16} />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-semibold">Email</p>
                            <p className="text-sm text-gray-800">{sug.email}</p>
                          </div>
                        </div>
                      )}

                      {/* CTA Link */}
                      {sug.cta_link && (
                        <div className="flex items-start gap-3">
                          <LinkIcon className="text-[#EDB920] shrink-0 mt-0.5" size={16} />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-semibold">Website/Link</p>
                            <a 
                              href={sug.cta_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline break-all"
                            >
                              {sug.cta_link}
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Submitted By */}
                      <div className="flex items-start gap-3 pt-2 border-t">
                        <User className="text-gray-400 shrink-0 mt-0.5" size={16} />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-semibold">Submitted By</p>
                          <p className="text-sm text-gray-800">
                            {sug.user_name} ({sug.user_connection})
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {sug.description && (
                    <div className="mb-6">
                      <h4 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-2">Description</h4>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed">{sug.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Admin Comments */}
                  {sug.admin_comments && (
                    <div className="mb-6">
                      <h4 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <MessageSquare size={14} /> Additional Comments
                      </h4>
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <p className="text-sm italic text-blue-900">{sug.admin_comments}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    {isComplete && (
                      <button 
                        onClick={() => handleQuickApprove(sug)}
                        disabled={isProcessing}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                      >
                        <Zap size={18} />
                        {isProcessing ? "Publishing..." : "Quick Approve & Publish"}
                      </button>
                    )}
                    <button 
                      onClick={() => handleEditReview(sug)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 bg-[#0F2E6A] hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      {isComplete ? "Review Before Publishing" : "Review & Edit"}
                    </button>
                    <button 
                      onClick={() => handleDelete(sug.id, sug.resource_name)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                      Discard
                    </button>
                  </div>

                  {/* Missing fields warning */}
                  {!isComplete && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={16} />
                      <div className="text-xs text-yellow-800">
                        <p className="font-bold mb-1">Missing Required Fields</p>
                        <p>
                          This suggestion needs: 
                          {!sug.resource_name?.trim() && " Resource Name"}
                          {!sug.description?.trim() && " Description"}
                          {!sug.location?.trim() && " Location"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}