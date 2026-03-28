import { useState } from 'react';
import api from '../../api/api';
import { Send, DollarSign, Calendar, Clock, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OpenGigsList({ gigs, onBidAction }) {
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [selectedGig, setSelectedGig] = useState(null);
  const [bidProposal, setBidProposal] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openBidModal = (gig) => {
    setSelectedGig(gig);
    setBidProposal('');
    setBidAmount('');
    setBidModalOpen(true);
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!bidProposal || !bidAmount) return;
    setSubmitting(true);

    try {
      await api.post(`/gigs/${selectedGig.id}/bids`, { 
        proposal: bidProposal, 
        budget: parseFloat(bidAmount) 
      });
      setBidModalOpen(false);
      if (onBidAction) onBidAction();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {gigs.length === 0 ? (
        <div className="col-span-full glass p-20 text-center rounded-[32px]">
          <div className="inline-flex p-4 rounded-full bg-white/5 mb-6">
            <Clock className="text-white/20" size={40} />
          </div>
          <p className="text-white/40 font-black uppercase tracking-[0.3em] text-xs">No active nodes in the mesh.</p>
        </div>
      ) : (
        gigs.map((gig, index) => (
          <motion.div 
            key={gig.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-8 flex flex-col justify-between group"
          >
            <div>
              <div className="flex justify-between items-start mb-8">
                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-white/40 uppercase tracking-widest">
                  GIG_NODE_{String(gig.id).slice(0, 8)}
                </div>
                <div className="text-3xl font-black text-green-500 flex items-center gap-1 glow-primary">
                  <DollarSign size={24} />
                  {gig.budget}
                </div>
              </div>

              <h3 className="text-3xl font-black text-white mb-4 tracking-tight group-hover:text-gradient transition-all">{gig.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">{gig.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-10">
                {gig.skillsRequired?.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-white/80 uppercase tracking-widest">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-white/5">
              <div className="flex items-center gap-3 text-white/40">
                <Clock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">TTL: {new Date(gig.deadline).toLocaleDateString()}</span>
              </div>
              
              <button 
                onClick={() => openBidModal(gig)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 group/btn"
              >
                Config Bid <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))
      )}

      {/* Bid Modal */}
      <AnimatePresence>
        {bidModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBidModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass p-10 md:p-12 w-full max-w-xl relative z-10 rounded-[40px] border border-white/10"
            >
              <button 
                onClick={() => setBidModalOpen(false)}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-10">
                <h3 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">Compile_Bid</h3>
                <p className="text-sm text-white/40 font-black uppercase tracking-widest">Node: {selectedGig?.title}</p>
              </div>
              
              <form onSubmit={handleBidSubmit} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 ml-1">Proposal_Payload</label>
                  <textarea 
                    required 
                    rows="6" 
                    value={bidProposal} 
                    onChange={e => setBidProposal(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm font-medium text-white focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/20 outline-none" 
                    placeholder="Technical specifications and value proposition..."
                  ></textarea>
                </div>
                
                <div>
                   <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 ml-1">Budget_Threshold_($)</label>
                   <div className="relative">
                     <input 
                       required 
                       type="number" 
                       min="1" 
                       value={bidAmount} 
                       onChange={e => setBidAmount(e.target.value)} 
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/20 pl-14 outline-none" 
                       placeholder="0.00" 
                     />
                     <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                   </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 py-5 px-10 text-[11px] font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                  >
                    {submitting ? 'Transmitting...' : 'Execute Bid_Transmission 🚀'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
