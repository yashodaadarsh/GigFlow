import { useState } from 'react';
import api from '../../api/api';
import { motion } from 'framer-motion';
import { Send, DollarSign, Calendar, Cpu, Terminal, Box, Activity, Shield } from 'lucide-react';

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
      const payload = {
        title,
        description,
        skillsRequired: skillsString.split(',').map(s => s.trim()),
        budget: parseFloat(budget),
        deadline: deadline ? new Date(deadline).toISOString() : null
      };
      await api.post('/gigs', payload);
      setTitle(''); setDescription(''); setSkillsString(''); setBudget(''); setDeadline('');
      if (onGigPosted) onGigPosted();
    } catch (err) {
      console.error('DEPLOYMENT_FAILURE', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-10 md:p-16 border border-white/10 max-w-5xl mx-auto relative overflow-hidden shadow-2xl"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-indigo-500 shadow-2xl shadow-indigo-500/10 transition-transform hover:scale-105">
            <Box size={32} />
          </div>
          <div>
            <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic text-gradient">Secure_Broadcaster</h3>
            <p className="text-[10px] text-indigo-500 font-black tracking-[0.4em] uppercase mt-2">Status: Uplink_Ready</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
          <Activity size={14} className="text-indigo-500 animate-pulse" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Node_Auth_Validated</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          <div className="md:col-span-2 group">
            <label className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 ml-1 group-focus-within:text-indigo-400 transition-colors">
              <Terminal size={14} /> Mission_Title_Vector
            </label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-black text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-white/10"
              placeholder="e.g. CORE_SYSTEMS_OVERHAUL"
            />
          </div>

          <div className="md:col-span-2 group">
            <label className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 ml-1 group-focus-within:text-indigo-400 transition-colors">
              <Shield size={14} /> Technical_Specifications
            </label>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows="5"
              className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-sm font-medium text-white/80 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-white/10 resize-none leading-relaxed"
              placeholder="> Initialize documentation for technical scope..."
            ></textarea>
          </div>

          <div className="md:col-span-2 group">
            <label className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 ml-1 group-focus-within:text-indigo-400 transition-colors">
              <Cpu size={14} /> Skill_Prerequisites
            </label>
            <input
              required
              value={skillsString}
              onChange={e => setSkillsString(e.target.value)}
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-black text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-white/10"
              placeholder="React, Java, WebRTC, Kafka"
            />
          </div>

          <div className="group">
            <label className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 ml-1 group-focus-within:text-indigo-400 transition-colors">
              <DollarSign size={14} /> Network_Allocation_($)
            </label>
            <div className="relative">
              <input
                required
                value={budget}
                onChange={e => setBudget(e.target.value)}
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-black text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-white/10 pl-14"
                placeholder="0.00"
              />
              <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            </div>
          </div>

          <div className="group">
            <label className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 ml-1 group-focus-within:text-indigo-400 transition-colors">
              <Calendar size={14} /> Expiration_Timestamp
            </label>
            <input
              required
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              type="datetime-local"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-black text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-6 bg-indigo-600 text-white font-black uppercase tracking-[0.5em] text-[11px] rounded-2xl transition-all shadow-2xl shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 mt-8 hover:bg-white hover:text-indigo-600"
        >
          {loading ? 'Transmitting_Uplink...' : '[ Broadcast_To_Mesh ]'}
          {!loading && <Send size={20} className="ml-2" />}
        </button>
      </form>
    </motion.div>
  );
}