import React, { useState } from 'react';
import { ChevronLeft, Send, Info, Phone, Link as LinkIcon, Clock, UserCheck } from 'lucide-react';
import { Link } from 'react-router';

export default function SuggestionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    resource_name: '',
    description: '',
    department_id: '',
    location: '',
    phone: '',
    email: '',
    keywords: '',
    hours: '',
    cta_link: '',
    user_name: '',
    user_connection: '',
    admin_comments: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-[#0F2E6A] text-white py-12 shadow-lg">
        <div className="max-w-4xl mx-auto px-6">
          <Link to="/" className="flex items-center text-blue-200 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="w-5 h-5" /> Back
          </Link>
          <h1 className="text-4xl font-black">Suggest an Update</h1>
          <p className="text-blue-100 mt-2">Help keep the GOAT Guide accurate for all Hilltoppers.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 -mt-8 space-y-6">
        {/* SECTION 1: BASIC INFO */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="flex items-center gap-2 text-[#0F2E6A] font-bold text-lg mb-6 border-b pb-2">
            <Info className="w-5 h-5 text-[#EDB920]" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Resource Name</label>
              <input required className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-[#EDB920] outline-none" 
                onChange={e => setFormData({...formData, resource_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Department ID (If known)</label>
              <input className="w-full p-3 bg-gray-50 border rounded-xl" type="number"
                onChange={e => setFormData({...formData, department_id: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Keywords / Tags</label>
              <input className="w-full p-3 bg-gray-50 border rounded-xl" placeholder="Wellness, Food, Academic"
                onChange={e => setFormData({...formData, keywords: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Resource Description</label>
              <textarea className="w-full p-3 bg-gray-50 border rounded-xl h-24" 
                onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT & LINKS */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="flex items-center gap-2 text-[#0F2E6A] font-bold text-lg mb-6 border-b pb-2">
            <Phone className="w-5 h-5 text-[#EDB920]" /> Location & Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input placeholder="Location / Room #" className="w-full p-3 bg-gray-50 border rounded-xl" 
              onChange={e => setFormData({...formData, location: e.target.value})} />
            <input placeholder="Phone Number" className="w-full p-3 bg-gray-50 border rounded-xl" 
              onChange={e => setFormData({...formData, phone: e.target.value})} />
            <input placeholder="Email Address" className="w-full p-3 bg-gray-50 border rounded-xl" 
              onChange={e => setFormData({...formData, email: e.target.value})} />
            <input placeholder="Website (CTA Link)" className="w-full p-3 bg-gray-50 border rounded-xl" 
              onChange={e => setFormData({...formData, cta_link: e.target.value})} />
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2"><Clock className="w-4 h-4" /> Hours of Operation</label>
              <input placeholder="Mon-Fri 8am-5pm" className="w-full p-3 bg-gray-50 border rounded-xl" 
                onChange={e => setFormData({...formData, hours: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SECTION 3: VERIFICATION */}
        <div className="bg-[#0F2E6A]/5 p-8 rounded-2xl border-2 border-dashed border-[#0F2E6A]/20">
          <h2 className="flex items-center gap-2 text-[#0F2E6A] font-bold text-lg mb-6">
            <UserCheck className="w-5 h-5 text-[#EDB920]" /> Why should we edit this?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input required placeholder="Your Name" className="w-full p-3 bg-white border rounded-xl" 
              onChange={e => setFormData({...formData, user_name: e.target.value})} />
            <input required placeholder="Your connection to resource (e.g. Employee)" className="w-full p-3 bg-white border rounded-xl" 
              onChange={e => setFormData({...formData, user_connection: e.target.value})} />
            <div className="md:col-span-2">
              <textarea placeholder="Additional comments or evidence for the admin..." className="w-full p-3 bg-white border rounded-xl h-24" 
                onChange={e => setFormData({...formData, admin_comments: e.target.value})} />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-[#EDB920] text-[#0F2E6A] font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all shadow-lg active:scale-[0.98]">
          <Send className="w-5 h-5" /> Submit Suggestion for Review
        </button>
      </form>
    </div>
  );
}