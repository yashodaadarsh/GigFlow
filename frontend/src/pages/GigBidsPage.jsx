import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/api';
import { ChevronLeft, Zap, Users, Trophy, MessageSquare, Video, CheckCircle } from 'lucide-react';

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

  // Real-time refresh when a new bid notification arrives for this gig
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
      alert('Success! Redirecting to pipeline...');
      navigate(`/project/${gigId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Hire action failed');
    } finally {
      setHiringId(null);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-gray-400">Loading Bids...</div>;
  if (!gig) return <div className="p-20 text-center text-red-500 font-bold">Gig not found or unauthorized.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <button 
        onClick={() => navigate('/dashboard/my-gigs')}
        className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all"
      >
        <ChevronLeft size={16} /> Back to dashboard
      </button>

      <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-50 overflow-hidden relative">
         <div className="relative z-10">
           <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">{gig.title}</h1>
                <p className="text-gray-400 font-medium mt-2 max-w-2xl">{gig.description}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-emerald-600 mb-2">${gig.budget}</div>
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100 italic">
                  Status: {gig.status}
                </span>
              </div>
           </div>
           
           <div className="flex flex-wrap gap-2">
             {gig.skillsRequired?.map(skill => (
               <span key={skill} className="px-4 py-2 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-gray-100">{skill}</span>
             ))}
           </div>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: AI Recommendations */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                 <Zap size={24} className="text-yellow-400 fill-yellow-400" />
                 <h2 className="text-xl font-black uppercase tracking-tight">AI Insights</h2>
               </div>
               
               {recommendations.length === 0 ? (
                 <p className="text-indigo-200 text-sm italic">Analyzing bidder profiles... check back in a moment.</p>
               ) : (
                 <div className="space-y-4">
                   {recommendations.slice(0, 3).map((rec, i) => (
                     <div key={rec.bidderId} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full">Top Match #{i+1}</span>
                         <span className="text-yellow-400 font-black text-xs">{(rec.score * 100).toFixed(0)}% Match</span>
                       </div>
                       <div className="font-bold mb-3">{rec.bidderName || `User #${rec.bidderId}`}</div>
                       <Link to={`/profile/${rec.bidderId}`} className="text-white/70 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group">
                         Profile <ChevronLeft size={14} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                       </Link>
                     </div>
                   ))}
                 </div>
               )}
             </div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-xl" />
           </div>

           <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6 text-gray-900">
                <Users size={20} />
                <h2 className="text-sm font-black uppercase tracking-tighter">Stats</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs font-bold uppercase">Total Bids</span>
                  <span className="text-gray-900 font-black">{bids.length}</span>
                </div>
              </div>
           </div>
        </div>

        {/* Right: Bids List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4 px-4">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
              <Trophy size={24} className="text-yellow-500" />
              Proposed Bids
            </h2>
          </div>

          <div className="space-y-4">
            {bids.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-100">
                <p className="text-gray-400 font-medium italic">No bids submitted yet.</p>
              </div>
            ) : (
              bids.map(bid => (
                <div key={bid.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 hover:shadow-xl transition-all group">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black text-xl border border-gray-200">
                          {bid.bidderName ? bid.bidderName[0].toUpperCase() : 'B'}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-gray-900 tracking-tight">{bid.bidderName || `Bidder #${bid.bidderId}`}</h4>
                          <Link to={`/profile/${bid.bidderId}`} className="text-indigo-600 hover:text-indigo-800 text-[10px] font-black uppercase tracking-widest mt-1 inline-block">View Full Profile →</Link>
                        </div>
                      </div>
                      <div className="text-2xl font-black text-emerald-600">${bid.budget}</div>
                   </div>

                   <div className="bg-gray-50/50 rounded-2xl p-5 mb-8 border border-gray-50 italic text-gray-600 text-sm leading-relaxed">
                     "{bid.proposal}"
                   </div>

                   <div className="flex gap-4">
                      {/* CHAT */}
                      <button
                        onClick={() => navigate(`/chat/${bid.bidderId}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                      >
                        <MessageSquare size={16} />
                        Message
                      </button>

                      {/* VIDEO */}
                      <button
                        onClick={() => navigate(`/video-call/${bid.bidderId}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border border-pink-100"
                      >
                        <Video size={16} />
                        Interview
                      </button>

                      {/* HIRE */}
                      <button
                        onClick={() => handleHire(bid.bidderId)}
                        disabled={hiringId !== null}
                        className="flex-[2] flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle size={16} />
                        {hiringId === bid.bidderId ? 'Hiring...' : 'Hire Bidder'}
                      </button>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
