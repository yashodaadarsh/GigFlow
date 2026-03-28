import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusSquare, History,
  Activity, Zap, CheckCircle, Terminal, Cpu
} from 'lucide-react';
import api from '../api/api';
import DashboardLayout from '../components/Layout/DashboardLayout';

// Sub-components
import MyPostedGigs from '../components/Dashboard/MyPostedGigs';
import PostGigForm from '../components/Dashboard/PostGigForm';
import Profile from './Profile';

export default function HirerDashboard() {
  const { user } = useSelector(state => state.auth);
  const [myGigs, setMyGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchMyGigs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/gigs/my-gigs');
      setMyGigs(data || []);
    } catch (err) {
      console.error('CRITICAL_ERR: Failed to fetch mesh gigs', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyGigs();
  }, [fetchMyGigs]);

  const stats = {
    posted: myGigs.length,
    ongoing: myGigs.filter(g => ['ASSIGNED', 'ONGOING'].includes(g.status)).length,
    completed: myGigs.filter(g => ['COMPLETED', 'DELIVERED'].includes(g.status)).length
  };

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Header Stats Bento */}
        <header className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="GIGS_DEPLOYED" value={stats.posted} icon={<Zap size={20} />} color="var(--success)" />
          <StatCard label="ACTIVE_TASKS" value={stats.ongoing} icon={<Activity size={20} />} color="var(--accent-color)" />
          <StatCard label="COMPLETED_OPS" value={stats.completed} icon={<CheckCircle size={20} />} color="var(--text-secondary)" />
        </header>

        {/* Router Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<Profile stats={stats} />} />
              <Route path="post-gig" element={<PostGigForm onGigPosted={fetchMyGigs} />} />
              <Route path="my-gigs" element={<MeshView title="Active Mesh" gigs={myGigs.filter(g => g.status !== 'COMPLETED')} />} />
              <Route path="completed" element={<MeshView title="Event History" gigs={myGigs.filter(g => g.status === 'COMPLETED')} />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
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

function MeshView({ title, gigs }) {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b border-white/10 pb-8">
        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter text-gradient">{title}</h2>
        <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/60 uppercase tracking-widest">
          Live_Sync_Status: <span className="text-green-500">Active</span>
        </div>
      </div>
      <MyPostedGigs gigs={gigs} />
    </div>
  );
}