import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Zap, ArrowRight, Box, Cpu, DollarSign, Clock } from 'lucide-react';

export default function MyPostedGigs({ gigs }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {gigs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 glass rounded-[32px] border border-dashed border-white/10"
        >
          <Box className="mx-auto text-white/10 mb-6" size={48} />
          <p className="text-white/30 font-black uppercase text-[10px] tracking-[0.4em] italic">
            Zero_Active_Nodes_Detected_In_Mesh
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {gigs.map((gig, i) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/dashboard/gig/${gig.id}`)}
              className="relative glass-card p-8 hover:border-indigo-500/40 transition-all cursor-pointer group overflow-hidden"
            >
              {/* Status Accent Bar */}
              <div 
                className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 group-hover:w-2`} 
                style={{ backgroundColor: gig.status === 'OPEN' ? 'hsl(var(--success))' : 'hsl(var(--accent-color))' }}
              />

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[10px] font-mono text-white/20 font-black tracking-widest uppercase">
                      ID_{String(gig.id).slice(-8)}
                    </span>
                    <h4 className="text-3xl font-black text-white group-hover:text-gradient transition-all uppercase tracking-tighter italic">
                      {gig.title}
                    </h4>
                    <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                        gig.status === 'OPEN'
                        ? 'bg-green-500/10 border-green-500/20 text-green-500'
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                      }`}>
                      {gig.status}
                    </div>
                  </div>

                  <p className="text-white/40 text-sm font-medium line-clamp-1 mb-8 max-w-2xl italic">
                    {"> "} {gig.description}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {gig.skillsRequired?.map(skill => (
                      <span
                        key={skill}
                        className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-lg group-hover:border-white/20 transition-all"
                      >
                        <Cpu size={12} className="text-indigo-500/60" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center md:items-end gap-10 w-full md:w-auto pt-8 md:pt-0 border-t md:border-t-0 border-white/5">
                  <div className="flex flex-col items-start md:items-end">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">NETWORK_VALUATION</span>
                    <div className="text-4xl font-black text-white flex items-center gap-1 group-hover:scale-105 transition-transform">
                      <DollarSign size={20} className="text-white/20" />
                      {gig.budget}
                    </div>
                  </div>

                  <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:shadow-2xl group-hover:shadow-indigo-500/20">
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Background Glow */}
              <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-indigo-500/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}