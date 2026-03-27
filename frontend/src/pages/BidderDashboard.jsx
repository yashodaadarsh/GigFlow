import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import OpenGigsList from '../components/Dashboard/OpenGigsList';
import MyBiddedGigs from '../components/Dashboard/MyBiddedGigs';
import Profile from './Profile';
import api from '../api/api';

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
      <Routes>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<Profile stats={stats} />} />
        <Route path="find-gigs" element={
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Available Gigs</h2>
            <OpenGigsList gigs={openGigs} onBidAction={fetchData} />
          </div>
        } />
        <Route path="my-bids" element={
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-3 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight ml-4">My Bids</h2>
                <div className="flex gap-2">
                  {['ALL', 'OPEN', 'ACCEPTED', 'REJECTED'].map(f => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-6 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all ${
                        filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
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
    </DashboardLayout>
  );
}
