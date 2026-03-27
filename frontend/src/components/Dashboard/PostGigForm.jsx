import { useState } from 'react';
import api from '../../api/api';
import { Send, DollarSign, Calendar, Sparkles } from 'lucide-react';

export default function PostGigForm({ onGigPosted }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsString, setSkillsString] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let formattedDeadline = deadline;
      if (deadline) {
        const d = new Date(deadline);
        if (!isNaN(d.getTime())) {
          formattedDeadline = d.toISOString().slice(0, 16);
        }
      }

      const payload = {
        title,
        description,
        skillsRequired: skillsString.split(',').map(s => s.trim()),
        budget: parseFloat(budget),
        deadline: formattedDeadline || null
      };
      await api.post('/gigs', payload);
      setTitle(''); setDescription(''); setSkillsString(''); setBudget(''); setDeadline('');
      if (onGigPosted) onGigPosted();
      alert('Gig published successfully! ✨');
    } catch (err) {
      alert('Failed to post gig');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-2xl rounded-[2.5rem] p-8 md:p-10 border border-gray-100 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
           <Send size={24} />
        </div>
        <div>
           <h3 className="text-2xl font-black text-gray-900 tracking-tight">Post a New Gig</h3>
           <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Reach top talent in minutes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Gig Title</label>
            <input 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              type="text" 
              className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-300" 
              placeholder="e.g. Need Senior React Developer for Fintech App" 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Project Description</label>
            <textarea 
              required 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows="4" 
              className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-300" 
              placeholder="What needs to be done? Be specific about the requirements..."
            ></textarea>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Required Skills (Comma separated)</label>
            <div className="relative">
              <input 
                required 
                value={skillsString} 
                onChange={e => setSkillsString(e.target.value)} 
                type="text" 
                className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-300 pl-12" 
                placeholder="React, Node.js, TailWindCSS, AI" 
              />
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Budget ($)</label>
            <div className="relative">
              <input 
                required 
                value={budget} 
                onChange={e => setBudget(e.target.value)} 
                type="number" 
                min="1" 
                className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-300 pl-12" 
                placeholder="1500" 
              />
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Deadline</label>
            <div className="relative">
              <input 
                required 
                value={deadline} 
                onChange={e => setDeadline(e.target.value)} 
                type="datetime-local" 
                className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-300 pl-12" 
              />
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
        >
          {loading ? 'Publishing...' : 'Publish Gig Now'}
          {!loading && <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
