import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Zap, CheckCircle, Clock, MessageSquare, ArrowRight, DollarSign } from 'lucide-react';

export default function MyBiddedGigs({ biddedGigs, filter = 'ALL' }) {
  const navigate = useNavigate();

  const statusConfig = {
    PENDING:     { color: 'var(--warning)', icon: <Clock size={12} /> },
    SHORTLISTED: { color: 'var(--accent-color)', icon: <Zap size={12} /> },
    ACCEPTED:    { color: 'var(--success)', icon: <CheckCircle size={12} /> },
    REJECTED:    { color: 'var(--danger)', icon: <Activity size={12} /> },
    ONGOING:     { color: 'var(--accent-color)', icon: <Activity size={12} /> },
    COMPLETED:   { color: 'var(--text-muted)', icon: <CheckCircle size={12} /> },
    ASSIGNED:    { color: 'var(--accent-color)', icon: <Activity size={12} /> },
    HIRED:       { color: 'var(--success)', icon: <CheckCircle size={12} /> },
  };

  const filteredGigs = biddedGigs.filter(gig => {
    if (filter === 'ALL') return true;
    if (filter === 'OPEN') return gig.status === 'OPEN';
    return gig.status === filter;
  });

  return (
    <div className="space-y-6">
      {filteredGigs.length === 0 ? (
        <div className="glass p-16 text-center rounded-[32px]">
          <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">No transmissions detected for this sector.</p>
        </div>
      ) : (
        filteredGigs.map((gig, index) => {
          const config = statusConfig[gig.status] || { color: 'var(--text-muted)', icon: <Activity size={12} /> };
          return (
            <motion.div 
              key={gig.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-8 flex flex-col md:flex-row justify-between items-center group relative overflow-hidden"
            >
              <div className="flex-1 w-full">
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2`} style={{ color: `hsl(${config.color})` }}>
                    {config.icon}
                    {gig.status || 'UNKNOWN'}
                  </span>
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Node_ID: {String(gig.id).slice(0, 8)}</span>
                </div>
                
                <h4 className="text-2xl font-black text-white group-hover:text-gradient transition-all tracking-tight mb-2 uppercase italic">{gig.title}</h4>
                <p className="text-white/50 text-sm font-medium line-clamp-1 mb-6 italic">{"> "} {gig.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {gig.skillsRequired?.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-white/60 uppercase tracking-widest">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end gap-6 w-full md:w-auto mt-8 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">ALLOCATED_CREDITS</span>
                  <div className="text-3xl font-black text-white flex items-center gap-1 group-hover:text-green-500 transition-colors">
                    <DollarSign size={20} className="text-white/20" />
                    {gig.budget}
                  </div>
                </div>

                <div className="flex gap-3">
                  {['ACCEPTED', 'ONGOING', 'ASSIGNED', 'COMPLETED', 'PAYMENT_PENDING', 'DELIVERED', 'HIRED'].includes(gig.status) && (
                    <>
                      <button
                        onClick={() => navigate(`/gig-pipeline/${gig.id}`)}
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                      >
                        <Activity size={14} className="text-indigo-500" />
                        Pipeline
                      </button>
                      {gig.hirerId && (
                        <button
                          onClick={() => navigate(`/chat/${gig.hirerId}`)}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                        >
                          <MessageSquare size={14} />
                          Secure_Comms
                        </button>
                      )}
                    </>
                  )}
                  {gig.status === 'PENDING' && (
                    <div className="h-10 px-4 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-white/20 uppercase tracking-widest italic">
                      Awaiting_Handshake...
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
