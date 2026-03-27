import { useState } from 'react';
import api from '../../api/api';
import { Send, DollarSign, Calendar, Clock, ArrowRight } from 'lucide-react';

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
      alert('Bid submitted successfully! 🚀');
      setBidModalOpen(false);
      if (onBidAction) onBidAction();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {gigs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">No open gigs available at the moment.</p>
        </div>
      ) : (
        gigs.map(gig => (
          <div key={gig.id} className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                   <h4 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{gig.title}</h4>
                   <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">Open</span>
                </div>
                <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6 max-w-2xl line-clamp-2">{gig.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {gig.skillsRequired?.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-wider rounded-xl border border-gray-100">{skill}</span>
                  ))}
                </div>

                <div className="flex items-center gap-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
                   <div className="flex items-center gap-2">
                     <Clock size={16} className="text-indigo-400" />
                     <span>Ends: {new Date(gig.deadline).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
              
              <div className="text-right ml-6 flex flex-col items-end shrink-0">
                <div className="text-3xl font-black text-gray-900 mb-6">${gig.budget}</div>
                <button 
                  onClick={() => openBidModal(gig)} 
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center gap-2 group/btn"
                >
                  Place Bid 
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
          </div>
        ))
      )}

      {/* Bid Modal */}
      {bidModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 w-full max-w-lg animate-in zoom-in-95">
            <h3 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Submit Your Bid</h3>
            <p className="text-sm text-gray-400 font-medium mb-8">Pitch your skills to {selectedGig?.title}</p>
            
            <form onSubmit={handleBidSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Your Proposal</label>
                <textarea 
                  required 
                  rows="5" 
                  value={bidProposal} 
                  onChange={e => setBidProposal(e.target.value)} 
                  className="w-full bg-gray-50 border-0 rounded-3xl px-6 py-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-300" 
                  placeholder="Why are you the perfect fit for this role?"
                ></textarea>
              </div>
              
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Proposed Budget ($)</label>
                 <div className="relative">
                   <input 
                     required 
                     type="number" 
                     min="1" 
                     value={bidAmount} 
                     onChange={e => setBidAmount(e.target.value)} 
                     className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-300 pl-14" 
                     placeholder="e.g. 1200" 
                   />
                   <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                 </div>
              </div>
              
              <div className="flex gap-4 mt-10">
                <button 
                  type="button" 
                  onClick={() => setBidModalOpen(false)} 
                  className="flex-1 py-4 text-sm font-black text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-2 py-4 px-10 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Send Bid 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
