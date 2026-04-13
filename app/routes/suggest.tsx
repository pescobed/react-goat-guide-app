import React, { useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { Link } from 'react-router';

export default function SuggestionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    resource_name: '',
    location: '',
    description: '',
    keywords: '',
    contact_info: ''
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

  if (submitted) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold text-[#0F2E6A]">Thank you!</h2>
      <p className="text-gray-600 mt-2">The admin will review your suggestion soon.</p>
      <Link to="/" className="mt-4 text-blue-600 underline">Back to Guide</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-[#0F2E6A] text-white py-12 mb-8">
        <div className="max-w-3xl mx-auto px-4">
          <Link to="/" className="flex items-center text-gray-300 mb-4"><ChevronLeft /> Back</Link>
          <h1 className="text-3xl font-bold">Suggest an Update</h1>
          <p className="text-blue-100">Help keep the GOAT Guide accurate for all Hilltoppers.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 space-y-4 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Resource Name</label>
          <input required className="w-full p-2 border rounded" type="text" 
            onChange={e => setFormData({...formData, resource_name: e.target.value})} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Location (Bldg/Room)</label>
            <input className="w-full p-2 border rounded" type="text" 
              onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tags (Comma separated)</label>
            <input className="w-full p-2 border rounded" type="text" placeholder="Wellness, Food, Academic"
              onChange={e => setFormData({...formData, keywords: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Description / Feedback</label>
          <textarea required className="w-full p-2 border rounded h-32" 
            onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>

        <button type="submit" className="w-full bg-[#EDB920] text-[#0F2E6A] font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors">
          <Send className="w-4 h-4" /> Submit Suggestion
        </button>
      </form>
    </div>
  );
}