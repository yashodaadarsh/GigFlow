import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/api';
import { ChevronLeft, Zap, Users, Trophy, MessageSquare, Video, CheckCircle, DollarSign, Activity, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/Layout/DashboardLayout';

export default function GigBidsPage() {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiringId, setHiringId] = useState(null);
  const { list: notifications } = useSelector(state => state.notifications);

  const fetchData = async () => {
    try {
      const [gigRes, bidsRes, recsRes] = await Promise.all([
        api.get(`/gigs/my-gigs`), 
        api.get(`/gigs/${gigId}/bids`),
        api.get(`/gigs/${gigId}/recommendations`)
      ]);
      const currentGig = gigRes.data.find(g => String(g.id) === String(gigId));
      setGig(currentGig);
      setBids(bidsRes.data || []);
      setRecommendations(recsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch gig details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [gigId]);

  useEffect(() => {
    const latestNotif = notifications[0];
    if (latestNotif?.type === 'NEW_BID' && String(latestNotif?.relatedId) === String(gigId)) {
      fetchData();
    }
  }, [notifications]);

  const handleHire = async (bidderId) => {
    setHiringId(bidderId);
    try {
      await api.post(`/gigs/${gigId}/hire/${bidderId}`);
      navigate(`/gig-pipeline/${gigId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Hire action failed');
    } finally {
      setHiringId(null);
    }
  };

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!gig) return (
    <div className="min-h-[50vh] flex items-center justify-center font-black text-white/20 uppercase tracking-[0.3em]">
      Gig_Node_Offline_Or_Restricted
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-12">
        <button 
          onClick={() => navigate('/dashboard/my-gigs')}
          className="flex items-center gap-3 text-white/30 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> [ Return_To_Mesh ]
        </button>

        <div className="glass-card p-12 relative overflow-hidden group">
           <div className="relative z-10">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-10">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-white/40 uppercase tracking-widest">GIG_REF: {gigId}</span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest italic animate-pulse">
                       <Activity size={10} /> Live_Bidding_Open
                    </span>
                  </div>
                  <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic text-gradient mb-4 leading-none">{gig.title}</h1>
                  <p className="text-white/40 font-medium max-w-2xl italic leading-relaxed">{"> "} {gig.description}</p>
                </div>
                <div className="text-left md:text-right shrink-0">
                  <div className="text-5xl font-black text-white mb-4 glow-primary flex items-center gap-2">
                    <DollarSign size={24} className="text-white/20" />
                    {gig.budget}
                  </div>
                  <span className="px-5 py-2 glass border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-full italic">
                    Node_Status: {gig.status}
                  </span>
                </div>
             </div>
             
             <div className="flex flex-wrap gap-2.5">
               {gig.skillsRequired?.map(skill => (
                 <span key={skill} className="px-4 py-2 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10 hover:border-white/30 transition-all">{skill}</span>
               ))}
             </div>
           </div>
           {/* Decorative Grid */}
           <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* AI Insights & Stats */}
          <div className="lg:col-span-1 space-y-10">
             <div className="glass p-10 rounded-[40px] border-indigo-500/20 relative overflow-hidden group hover:scale-[1.02] transition-all">
               <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                     <Zap size={24} className="text-white fill-white/20" />
                   </div>
                   <div>
                     <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">AI_Node_Scout</h2>
                     <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em]">Neural_Match_Optimization</p>
                   </div>
                 </div>
                 
                 {recommendations.length === 0 ? (
                   <div className="py-6 border-t border-white/5">
                      <p className="text-white/20 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-3">
                        <Activity size={12} className="animate-spin" /> Analyzing_Bidder_Frequency...
                      </p>
                   </div>
                 ) : (
                   <div className="space-y-6">
                     {recommendations.slice(0, 3).map((rec, i) => (
                       <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={rec.bidderId} 
                        className="bg-white/5 rounded-3xl p-6 border border-white/10 group/rec hover:border-indigo-500/30 transition-all"
                       >
                         <div className="flex justify-between items-center mb-4">
                           <span className="text-[9px] font-black uppercase text-indigo-400">Match_Vector_0{i+1}</span>
                           <span className="text-white font-black text-[10px] bg-indigo-500/20 px-3 py-1 rounded-full">{(rec.score * 100).toFixed(0)}%_SNR</span>
                         </div>
                         <div className="text-lg font-black text-white mb-4 uppercase tracking-tight">{rec.bidderName || `UNKN_NODE_${rec.bidderId}`}</div>
                         <Link to={`/profile/${rec.bidderId}`} className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                           Profile_Access <ChevronLeft size={14} className="rotate-180" />
                         </Link>
                       </motion.div>
                     ))}
                   </div>
                 )}
               </div>
               <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-colors" />
             </div>
          </div>

          {/* Proposed Bids */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between px-4 pb-4 border-b border-white/10">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                <Trophy size={28} className="text-white/20" />
                Transmission_Bids
              </h2>
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Count: {bids.length}</div>
            </div>

            <div className="space-y-8">
              {bids.length === 0 ? (
                <div className="text-center py-24 glass rounded-[40px] border-dashed border-white/5">
                  <p className="text-white/20 font-black uppercase tracking-[0.4em] italic text-xs">Awaiting_Uplink_Transmissions...</p>
                </div>
              ) : (
                bids.map((bid, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={bid.id} 
                    className="glass-card p-10 hover:border-white/20 transition-all group relative overflow-hidden"
                  >
                     <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8 relative z-10">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-white/20 font-black text-2xl border border-white/10 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xl">
                            {bid.bidderName ? bid.bidderName[0].toUpperCase() : 'B'}
                          </div>
                          <div>
                            <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic">{bid.bidderName || `NODE_${bid.bidderId}`}</h4>
                            <Link to={`/profile/${bid.bidderId}`} className="text-indigo-400 hover:text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mt-2 inline-block transition-all hover:translate-x-1">Identity_Profile_v1.0 →</Link>
                          </div>
                        </div>
                        <div className="text-4xl font-black text-white group-hover:text-green-500 transition-colors flex items-center gap-1">
                           <DollarSign size={20} className="text-white/10" />
                           {bid.budget}
                        </div>
                     </div>

                     <div className="bg-white/5 rounded-[32px] p-8 mb-10 border border-white/5 italic text-white/50 text-base leading-relaxed font-medium relative overflow-hidden group-hover:bg-white/[0.07] transition-all">
                       "{bid.proposal}"
                       <div className="absolute top-0 right-0 p-4 opacity-5"><MessageSquare size={40} /></div>
                     </div>

                     <div className="flex flex-wrap md:flex-nowrap gap-4">
                        <button
                          onClick={() => navigate(`/chat/${bid.bidderId}`)}
                          className="flex-1 flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-white/10"
                        >
                          <MessageSquare size={16} /> Secure_Comms
                        </button>

                        <button
                          onClick={() => navigate(`/video-call/${bid.bidderId}`)}
                          className="flex-1 flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-white/10"
                        >
                          <Video size={16} /> Hologram_Link
                        </button>

                        <button
                          onClick={() => handleHire(bid.bidderId)}
                          disabled={hiringId !== null}
                          className="flex-[1.5] flex items-center justify-center gap-3 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle size={18} />
                          {hiringId === bid.bidderId ? 'Authorizing...' : 'Authorize_Command'}
                        </button>
                     </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
