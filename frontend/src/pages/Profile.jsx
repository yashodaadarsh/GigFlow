import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8081/api/auth/profile/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('User not found');
                return res.json();
            })
            .then(data => { setProfile(data); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [id]);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
                </button>

                {/* Profile Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                        <div className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    </div>

                    {/* Avatar + Info */}
                    <div className="px-8 pb-8">
                        <div className="flex items-end gap-5 -mt-12 mb-6">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg border-4 border-white">
                                {getInitials(profile.name)}
                            </div>
                            <div className="mb-2">
                                <h1 className="text-2xl font-extrabold text-gray-900">{profile.name}</h1>
                                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold tracking-wide ${profile.role === 'BIDDER' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                                    {profile.role}
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
                            <div>
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
                    </div>
                </div>

                {/* User ID tag */}
                <p className="text-center text-xs text-gray-400 mt-4">Bidder ID: {profile.id}</p>
            </div>
        </div>
    );
}
