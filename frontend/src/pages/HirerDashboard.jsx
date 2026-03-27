import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import MyPostedGigs from '../components/Dashboard/MyPostedGigs';
import PostGigForm from '../components/Dashboard/PostGigForm';
import Profile from './Profile';
import api from '../api/api';

export default function HirerDashboard() {
  const { user } = useSelector(state => state.auth);
  const [myGigs, setMyGigs] = useState([]);

  const fetchMyGigs = async () => {
    try {
      const { data } = await api.get('/gigs/my-gigs');
      setMyGigs(data || []);
    } catch (err) {
      console.error('Failed to fetch my gigs', err);
    }
  };

  useEffect(() => {
    fetchMyGigs();
  }, []);

  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<Profile />} />
        <Route path="post-gig" element={<PostGigForm onGigPosted={fetchMyGigs} />} />
        <Route path="my-gigs" element={
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Active Gigs</h2>
            <MyPostedGigs gigs={myGigs.filter(g => g.status !== 'COMPLETED')} />
          </div>
        } />
        <Route path="completed" element={
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Completed History</h2>
            <MyPostedGigs gigs={myGigs.filter(g => g.status === 'COMPLETED')} />
          </div>
        } />
      </Routes>
    </DashboardLayout>
  );
}
