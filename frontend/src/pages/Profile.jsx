import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/api';

export default function Profile() {
    // currentUser from Redux: { id (Number), name (String), role (String: "HIRER"|"BIDDER") }
    const { user: currentUser } = useSelector(state => state.auth);
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hireStatus, setHireStatus] = useState(null); // null | 'hiring' | 'hired' | 'error'

    useEffect(() => {
        fetch(`http://localhost:8081/api/auth/profile/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('User not found');
                return res.json();
            })
            .then(data => { setProfile(data); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [id]);

    const handleHire = async () => {
        setHireStatus('hiring');
        try {
            await api.post(`/gigs/hire`, { bidderId: profile.id });
            setHireStatus('hired');
        } catch {
            setHireStatus('error');
        }
    };

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
    const getRatingStars = (rating) => {
        const filled = Math.round(rating || 0);
        return Array.from({ length: 5 }, (_, i) => i < filled ? '★' : '☆').join('');
    };

    const skillColors = [
        'bg-blue-100 text-blue-800', 'bg-purple-100 text-purple-800',
        'bg-green-100 text-green-800', 'bg-orange-100 text-orange-800',
        'bg-pink-100 text-pink-800', 'bg-cyan-100 text-cyan-800',
        'bg-yellow-100 text-yellow-800', 'bg-red-100 text-red-800',
    ];

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading profile...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
            <div className="text-center bg-white shadow-xl rounded-2xl p-10 max-w-sm">
                <div className="text-5xl mb-4">😕</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
                <p className="text-gray-500 text-sm mb-6">{error}</p>
                <button onClick={() => navigate(-1)} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
                    ← Go Back
                </button>
            </div>
        </div>
    );

    // Normalize: ensure both IDs are compared as strings, and role is uppercased
    const currentRole = (currentUser?.role || '').toUpperCase();          // "HIRER" | "BIDDER"
    const profileRole = (profile.role || '').toUpperCase();               // "HIRER" | "BIDDER"
    const isOwnProfile = String(currentUser?.id) === String(profile.id);  // type-safe comparison
    const canCommunicate = currentRole === 'HIRER' && profileRole === 'BIDDER' && !isOwnProfile;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
                </button>

                {/* Profile Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header Banner */}
                    <div className={`h-32 relative ${profileRole === 'HIRER' ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'}`}>
                        <div className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                        {/* Own profile badge */}
                        {isOwnProfile && (
                            <div className="absolute top-4 right-4 bg-white/30 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                                My Profile
                            </div>
                        )}
                    </div>

                    {/* Avatar + Info */}
                    <div className="px-8 pb-8">
                        <div className="flex items-end gap-5 -mt-12 mb-6">
                            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-lg border-4 border-white ${profileRole === 'HIRER' ? 'bg-gradient-to-br from-emerald-600 to-teal-600' : 'bg-gradient-to-br from-indigo-600 to-purple-600'}`}>
                                {getInitials(profile.name)}
                            </div>
                            <div className="mb-2">
                                <h1 className="text-2xl font-extrabold text-gray-900">{profile.name}</h1>
                                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold tracking-wide ${profileRole === 'BIDDER' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {profileRole}
                                </span>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-extrabold text-indigo-700">{profile.completedGigs ?? 0}</div>
                                <div className="text-xs text-indigo-500 font-medium mt-1">Gigs Completed</div>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-extrabold text-yellow-600">{(profile.rating ?? 0).toFixed(1)}</div>
                                <div className="text-xs text-yellow-500 font-medium mt-1">Rating</div>
                                <div className="text-yellow-400 text-sm">{getRatingStars(profile.rating)}</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-extrabold text-green-700">{profile.skills?.length ?? 0}</div>
                                <div className="text-xs text-green-500 font-medium mt-1">Skills</div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="mb-6 space-y-3">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Contact</h2>
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">✉️</div>
                                <span>{profile.email}</span>
                            </div>
                            {profile.organisation && (
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">🏢</div>
                                    <span>{profile.organisation}</span>
                                </div>
                            )}
                        </div>

                        {/* Skills */}
                        {profile.skills && profile.skills.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Skills</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, idx) => (
                                        <span
                                            key={skill}
                                            className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${skillColors[idx % skillColors.length]}`}
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ======================================================
                            ACTION PANEL — Only when Hirer views a Bidder profile
                        ====================================================== */}
                        {canCommunicate && (
                            <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {/* CHAT */}
                                    <button
                                        onClick={() => navigate(`/chat/${profile.id}`)}
                                        className="flex flex-col items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-4 rounded-2xl font-bold transition shadow-lg shadow-indigo-200 active:scale-95"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                        <span className="text-sm">Chat</span>
                                    </button>

                                    {/* VIDEO CALL */}
                                    <button
                                        onClick={() => navigate(`/video-call/${profile.id}`)}
                                        className="flex flex-col items-center justify-center gap-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 px-4 py-4 rounded-2xl font-bold transition active:scale-95"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                        <span className="text-sm">Video Call</span>
                                    </button>

                                    {/* HIRE */}
                                    <button
                                        onClick={handleHire}
                                        disabled={hireStatus === 'hired' || hireStatus === 'hiring'}
                                        className={`flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-2xl font-bold transition active:scale-95 ${hireStatus === 'hired'
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : hireStatus === 'error'
                                                    ? 'bg-red-50 text-red-600 border border-red-200'
                                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200'
                                            }`}
                                    >
                                        {hireStatus === 'hired' ? (
                                            <><span className="text-xl">✓</span><span className="text-sm">Hired!</span></>
                                        ) : hireStatus === 'error' ? (
                                            <><span className="text-xl">⚠️</span><span className="text-xs text-center">Go to Dashboard → accept bid</span></>
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <span className="text-sm">{hireStatus === 'hiring' ? 'Hiring...' : 'Hire'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Own profile edit hint */}
                        {isOwnProfile && (
                            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                                <p className="text-xs text-gray-400">This is your profile. Other users see this page when they view your profile.</p>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">User ID: {profile.id}</p>
            </div>
        </div>
    );
}
