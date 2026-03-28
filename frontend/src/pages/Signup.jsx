import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess } from '../redux/slices/auth.slice';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Terminal, User, Mail, Phone, Lock, Cpu, Briefcase } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'BIDDER',
    organisation: '',
    skills: ''
  });
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...formData };
      if (payload.role === 'BIDDER') {
        payload.skills = payload.skills.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        delete payload.skills;
      }

      const { data } = await api.post('/auth/signup', payload);
      dispatch(loginSuccess({ user: { id: data.userId, name: data.name, role: data.role }, token: data.token }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'REGISTRATION_ERR: Check node connectivity or email uniqueness.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Engineering Grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`, backgroundSize: '50px 50px' }}
      />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10b981]/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full space-y-8 relative z-10"
      >
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-[#10b981] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Hexagon size={28} className="text-[#0A0A0B] fill-[#0A0A0B]" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Register_Identity</h2>
          <p className="mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">Provision New Node in GigFlow Mesh</p>
        </div>

        <div className="bg-[#111111] border border-white/10 p-10 rounded-2xl shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-50" />

          <form className="mt-8 space-y-8" onSubmit={handleSignup}>
            {error && (
              <div className="text-[#10b981] text-[10px] font-black uppercase tracking-widest text-center bg-[#10b981]/10 p-3 border border-[#10b981]/20 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Identity Info */}
              <div className="space-y-4">
                <div className="group">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1 group-focus-within:text-[#10b981]">Full_Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#10b981]"><User size={14} /></div>
                    <input name="name" type="text" required className="appearance-none block w-full pl-11 pr-4 py-3 bg-[#0A0A0B] border border-white/10 text-white font-bold text-sm rounded-lg focus:outline-none focus:border-[#10b981] transition-all" placeholder="John Doe" value={formData.name} onChange={handleChange} />
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1 group-focus-within:text-[#10b981]">Contact_Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#10b981]"><Mail size={14} /></div>
                    <input name="email" type="email" required className="appearance-none block w-full pl-11 pr-4 py-3 bg-[#0A0A0B] border border-white/10 text-white font-bold text-sm rounded-lg focus:outline-none focus:border-[#10b981] transition-all" placeholder="root@node.io" value={formData.email} onChange={handleChange} />
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1 group-focus-within:text-[#10b981]">Access_Key</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#10b981]"><Lock size={14} /></div>
                    <input name="password" type="password" required className="appearance-none block w-full pl-11 pr-4 py-3 bg-[#0A0A0B] border border-white/10 text-white font-bold text-sm rounded-lg focus:outline-none focus:border-[#10b981] transition-all" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Role & Secondary Metadata */}
              <div className="space-y-4">
                <div className="group">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1 group-focus-within:text-[#10b981]">Phone_Link</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#10b981]"><Phone size={14} /></div>
                    <input name="phone" type="text" required className="appearance-none block w-full pl-11 pr-4 py-3 bg-[#0A0A0B] border border-white/10 text-white font-bold text-sm rounded-lg focus:outline-none focus:border-[#10b981] transition-all" placeholder="+1234..." value={formData.phone} onChange={handleChange} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Identity_Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="block w-full px-4 py-3 bg-[#0A0A0B] border border-white/10 text-[#10b981] font-black text-xs uppercase tracking-widest rounded-lg focus:outline-none focus:border-[#10b981]">
                    <option value="BIDDER">NODE_BIDDER (Find Work)</option>
                    <option value="HIRER">NODE_HIRER (Post Gigs)</option>
                  </select>
                </div>

                <AnimatePresence mode="wait">
                  {formData.role === 'HIRER' ? (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} key="hirer" className="group">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1 group-focus-within:text-[#10b981]">Organisation_ID</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#10b981]"><Briefcase size={14} /></div>
                        <input name="organisation" type="text" className="appearance-none block w-full pl-11 pr-4 py-3 bg-[#0A0A0B] border border-white/10 text-white font-bold text-sm rounded-lg focus:outline-none focus:border-[#10b981]" placeholder="Org Name" value={formData.organisation} onChange={handleChange} />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} key="bidder" className="group">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1 group-focus-within:text-[#10b981]">Skill_Vectors (Comma Separated)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#10b981]"><Cpu size={14} /></div>
                        <input name="skills" type="text" className="appearance-none block w-full pl-11 pr-4 py-3 bg-[#0A0A0B] border border-white/10 text-white font-bold text-sm rounded-lg focus:outline-none focus:border-[#10b981]" placeholder="React, Java, WebRTC" value={formData.skills} onChange={handleChange} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button type="submit" className="w-full py-4 border-2 border-[#10b981]/40 text-xs font-black uppercase tracking-[0.3em] rounded-lg text-[#10b981] bg-transparent hover:bg-[#10b981] hover:text-[#0A0A0B] transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] active:scale-95">
              [ Initialize_Identity_Sync ]
            </button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-white/5">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
              Existing Node? <Link to="/login" className="text-[#10b981] hover:text-white underline decoration-[#10b981]/30">Establish_Session</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}