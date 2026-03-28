import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/Layout/DashboardLayout';
import OpenGigsList from '../components/Dashboard/OpenGigsList';
import MyBiddedGigs from '../components/Dashboard/MyBiddedGigs';
import Profile from './Profile';
import api from '../api/api';
import { Zap, Activity, CheckCircle, Search, Filter } from 'lucide-react';

export default function BidderDashboard() {
  const { user } = useSelector(state => state.auth);
  const [openGigs, setOpenGigs] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [filter, setFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      const [gigsRes, bidsRes] = await Promise.all([
        api.get('/gigs'),
        api.get('/gigs/my-bids')
      ]);
      setOpenGigs(gigsRes.data || []);
      setMyBids(bidsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch bidder data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = {
    bids: myBids.length,
    accepted: myBids.filter(b => ['ASSIGNED', 'HIRED', 'ONGOING', 'COMPLETED', 'DELIVERED'].includes(b.status)).length,
    ongoing: myBids.filter(b => ['ASSIGNED', 'ONGOING', 'PAYMENT_PENDING'].includes(b.status)).length
  };

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Header Stats Bento */}
        <header className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="ACTIVE_BIDS" value={stats.bids} icon={<Search size={20} />} color="var(--accent-color)" />
          <StatCard label="ACCEPTED_OP" value={stats.accepted} icon={<CheckCircle size={20} />} color="var(--success)" />
          <StatCard label="RUNNING_NODES" value={stats.ongoing} icon={<Activity size={20} />} color="var(--warning)" />
        </header>

        <Routes>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<Profile stats={stats} />} />
          <Route path="find-gigs" element={
            <div className="space-y-10">
               <div className="flex items-center justify-between border-b border-white/10 pb-8">
                <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter text-gradient">Available Gigs</h2>
                <div className="flex items-center gap-4">
                   <div className="text-[10px] font-black text-white/40 uppercase tracking-widest hidden md:block">Realtime_Feed: <span className="text-green-500">Live</span></div>
                </div>
              </div>
              <OpenGigsList gigs={openGigs} onBidAction={fetchData} />
            </div>
          } />
          <Route path="my-bids" element={
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
                  <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter text-gradient">My Transmission Bids</h2>
                  <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                    {['ALL', 'OPEN', 'ACCEPTED', 'REJECTED'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                          filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
              </div>
              <MyBiddedGigs biddedGigs={myBids} filter={filter} />
            </div>
          } />
        </Routes>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="glass-card p-8 group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity" style={{ color: `hsl(${color})` }}>
        {icon}
      </div>
      <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">{label}</div>
      <div className="text-5xl font-black text-white glow-primary">{value}</div>
      <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: '100%' }} 
          className="h-full" 
          style={{ backgroundColor: `hsl(${color})` }} 
        />
      </div>
    </div>
  );
}
