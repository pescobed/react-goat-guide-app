import React, { useState } from 'react';
import { ChevronLeft, Send, Info, Phone, Link as LinkIcon, Clock, Heart } from 'lucide-react';
import { Link } from 'react-router';

export default function SuggestionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    resource_name: '',
    description: '',
    department_id: '',
    department_name: '', // Added this
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md">
          <Heart className="w-16 h-16 text-[#EDB920] mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#0F2E6A]">Thank You!</h2>
          <p className="text-gray-600 mt-2">Your feedback helps keep the Hilltop community connected. An admin will review your suggestion soon.</p>
          <Link to="/" className="mt-6 inline-block bg-[#0F2E6A] text-white px-6 py-2 rounded-xl font-bold">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-[#0F2E6A] text-white py-12 shadow-lg">
        <div className="max-w-4xl mx-auto px-6">
          <Link to="/" className="flex items-center text-blue-200 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="w-5 h-5" /> Back
          </Link>
          <h1 className="text-4xl font-black">Suggest an Update</h1>
          <p className="text-blue-100 mt-2">Notice something missing or incorrect? Let us know!</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 -mt-8 space-y-6">
        
        {/* SECTION 1: BASIC INFO */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="flex items-center gap-2 text-[#0F2E6A] font-bold text-lg mb-6 border-b pb-2">
            <Info className="w-5 h-5 text-[#EDB920]" /> Resource Identity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Resource Name</label>
              <input required className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-[#EDB920] outline-none" 
                placeholder="e.g., Health & Counseling Center"
                onChange={e => setFormData({...formData, resource_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Department Name</label>
              <input className="w-full p-3 bg-gray-50 border rounded-xl" 
                placeholder="e.g., Student Affairs"
                onChange={e => setFormData({...formData, department_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Keywords / Tags</label>
              <input className="w-full p-3 bg-gray-50 border rounded-xl" 
                placeholder="Wellness, Medical, Support"
                onChange={e => setFormData({...formData, keywords: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT & LINKS */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="flex items-center gap-2 text-[#0F2E6A] font-bold text-lg mb-6 border-b pb-2">
            <Phone className="w-5 h-5 text-[#EDB920]" /> Contact & Availability
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Location / Room #</label>
              <input placeholder="e.g., Main Bldg G14" className="w-full p-3 bg-gray-50 border rounded-xl" 
                onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number (10 Digits)</label>
              <input type="tel" placeholder="5121234567" className="w-full p-3 bg-gray-50 border rounded-xl" 
                onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Hours of Operation</label>
              <input placeholder="e.g., Mon-Fri: 8am-5pm, Sat: Closed" className="w-full p-3 bg-gray-50 border rounded-xl" 
                onChange={e => setFormData({...formData, hours: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SECTION 3: THE HEART OF THE FEEDBACK */}
        <div className="bg-[#0F2E6A]/5 p-8 rounded-2xl border-2 border-dashed border-[#0F2E6A]/20">
          <h2 className="flex items-center gap-2 text-[#0F2E6A] font-bold text-lg mb-4">
            <Heart className="w-5 h-5 text-[#EDB920]" /> We Value Your Input!
          </h2>
          <p className="text-sm text-gray-600 mb-6 italic">Please let us know who is making this request so we can reach out if we have questions.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input required placeholder="Your Full Name" className="w-full p-3 bg-white border rounded-xl" 
              onChange={e => setFormData({...formData, user_name: e.target.value})} />
            <input required placeholder="Your role (Student, Faculty, Staff)" className="w-full p-3 bg-white border rounded-xl" 
              onChange={e => setFormData({...formData, user_connection: e.target.value})} />
            <div className="md:col-span-2">
              <textarea placeholder="Tell us what needs changing and why..." className="w-full p-3 bg-white border rounded-xl h-32" 
                onChange={e => setFormData({...formData, admin_comments: e.target.value})} />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-[#EDB920] text-[#0F2E6A] font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all shadow-lg">
          <Send className="w-5 h-5" /> Send to Admin for Review
        </button>
      </form>
    </div>
  );
}