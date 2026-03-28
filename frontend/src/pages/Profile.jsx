import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    Terminal, Shield, Zap, Star, Cpu,
    MessageSquare, Video, UserPlus, ArrowLeft,
    Mail, Briefcase, Globe, Activity
} from 'lucide-react';
import api from '../api/api';

export default function Profile({ stats: propStats }) {
    const { user: currentUser } = useSelector(state => state.auth);
    const { id: urlId } = useParams();
    const profileId = urlId || currentUser?.id;
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hireStatus, setHireStatus] = useState(null);

    useEffect(() => {
        if (!profileId) {
            setError("ERR_NO_IDENTITY_FOUND");
            setLoading(false);
            return;
        }
        api.get(`/auth/profile/${profileId}`)
            .then(res => {
                setProfile(res.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.message || 'IDENTITY_NOT_FOUND');
                setLoading(false);
            });
    }, [profileId]);

    const handleHire = async () => {
        setHireStatus('hiring');
        try {
            await api.post(`/gigs/hire`, { bidderId: profile.id });
            setHireStatus('hired');
        } catch {
            setHireStatus('error');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center">
                <div className="w-16 h-16 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-2xl shadow-indigo-500/20" />
                <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Syncing_Identity_Stream...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="glass p-12 max-w-md text-center border-red-500/20 rounded-[40px]">
                <div className="text-red-500 text-4xl mb-6 font-black uppercase italic tracking-tighter decoration-red-500 underline decoration-4 underline-offset-8">Failed_Sync</div>
                <h2 className="text-lg font-black text-white/60 mb-8 uppercase tracking-widest">{error}</h2>
                <button onClick={() => navigate(-1)} className="w-full py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white hover:text-black transition-all">
                    ← TERMINATE_SEARCH
                </button>
            </div>
        </div>
    );

    const profileRole = (profile.role || '').toUpperCase();
    const isOwnProfile = String(currentUser?.id) === String(profile.id);
    const canCommunicate = (currentUser?.role || '').toUpperCase() === 'HIRER' && profileRole === 'BIDDER' && !isOwnProfile;
    const accentColor = profileRole === 'HIRER' ? 'var(--success)' : 'var(--accent-color)';

    return (
        <div className="min-h-screen py-20 px-6 font-sans relative">
            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    [ Return_To_Terminal ]
                </button>

                {/* Profile Console Body */}
                <div className="glass-card overflow-hidden shadow-2xl rounded-[48px]">

                    {/* Identity Banner */}
                    <div className="h-48 relative bg-white/5 border-b border-white/10 overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ backgroundImage: `radial-gradient(hsl(${accentColor}) 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
                        
                        <div className="absolute top-8 right-10">
                            <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] border-2 uppercase transition-all hover:scale-105`} style={{ backgroundColor: `hsla(${accentColor} / 0.1)`, borderColor: `hsla(${accentColor} / 0.2)`, color: `hsl(${accentColor})` }}>
                                NODE_IDENTITY::{profileRole}
                            </span>
                        </div>
                    </div>

                    <div className="px-12 pb-16">
                        {/* Identity Core */}
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-8 -mt-20 mb-16 relative z-20">
                            <div className="w-40 h-40 rounded-[40px] bg-black border-8 border-[#050505] flex items-center justify-center text-5xl font-black shadow-2xl" style={{ color: `hsl(${accentColor})`, boxShadow: `0 0 40px hsla(${accentColor} / 0.1)` }}>
                                {profile.name?.charAt(0)}
                            </div>
                            <div className="mb-4">
                                <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic text-gradient">{profile.name}</h1>
                                <div className="flex items-center gap-3 mt-3">
                                    <Globe size={14} className="text-white/20" />
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                                        UPLINK_ID: {String(profile.id).slice(0, 12)}...
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bento Stats Matrix */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                            <StatBox
                                label={profileRole === 'HIRER' ? 'GIGS_POSTED' : 'BIDS_PLACED'}
                                value={propStats ? (profileRole === 'HIRER' ? propStats.posted : propStats.bids) : (profile.completedGigs ?? 0)}
                                color={accentColor}
                            />
                            <StatBox
                                label="TRUST_SCORE"
                                value={propStats ? propStats.ongoing : (profile.rating ?? 0).toFixed(1)}
                                subText={!propStats ? "★".repeat(Math.round(profile.rating || 0)) : "ACTIVE_OPS"}
                                color="var(--accent-color)"
                            />
                            <StatBox
                                label={propStats ? 'COMPLETED' : 'SKILLS_LOADED'}
                                value={propStats ? propStats.completed : (profile.skills?.length ?? 0)}
                                color="var(--success)"
                            />
                        </div>

                        {/* Tech Stack / Metadata */}
                        <div className="grid md:grid-cols-2 gap-16">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                                        <Mail size={14} className="text-indigo-500" /> Identity_Comms
                                    </h3>
                                    <p className="text-lg font-black text-white uppercase tracking-tight">{profile.email}</p>
                                </div>

                                {profile.organisation && (
                                    <div>
                                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 flex items-center gap-3 pt-2">
                                            <Briefcase size={14} className="text-indigo-500" /> Organization_Sector
                                        </h3>
                                        <p className="text-lg font-black text-white uppercase tracking-tight italic">{profile.organisation}</p>
                                    </div>
                                )}
                            </div>

                            {profile.skills?.length > 0 && (
                                <div className="space-y-8">
                                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                                        <Cpu size={14} className="text-indigo-500" /> Technical_Vectors
                                    </h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {profile.skills.map(skill => (
                                            <span key={skill} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white/60 uppercase tracking-widest hover:border-white/30 transition-all hover:scale-105 cursor-default">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Command Panel */}
                        {canCommunicate && (
                            <div className="mt-16 pt-12 border-t border-white/5">
                                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-10 text-center italic">Executive_Protocol::Directives</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <ActionButton
                                        onClick={() => navigate(`/chat/${profile.id}`)}
                                        label="Secure_Chat"
                                        icon={<MessageSquare size={22} />}
                                        color="var(--success)"
                                    />
                                    <ActionButton
                                        onClick={() => navigate(`/video-call/${profile.id}`)}
                                        label="Hologram_Call"
                                        icon={<Video size={22} />}
                                        color="var(--accent-color)"
                                    />
                                    <ActionButton
                                        onClick={handleHire}
                                        disabled={['hiring', 'hired'].includes(hireStatus)}
                                        label={hireStatus === 'hired' ? 'DEPLOYED' : 'EXECUTE_HIRE'}
                                        icon={<UserPlus size={22} />}
                                        color={hireStatus === 'hired' ? 'var(--text-muted)' : 'var(--warning)'}
                                        status={hireStatus}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, color, subText }) {
    return (
        <div className="glass p-8 rounded-[32px] relative group overflow-hidden transition-all hover:scale-105 border-white/5">
            <div className="absolute top-0 left-0 w-1 h-full opacity-30 transition-all group-hover:w-full group-hover:opacity-5" style={{ backgroundColor: `hsl(${color})` }} />
            <div className="relative z-10">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">{label}</div>
                <div className="text-4xl font-black text-white tracking-tighter glow-primary">{value}</div>
                {subText && <div className="text-[9px] font-black mt-2 uppercase tracking-widest italic" style={{ color: `hsl(${color})` }}>{subText}</div>}
            </div>
        </div>
    );
}

function ActionButton({ onClick, label, icon, color, disabled, status }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-center justify-center gap-4 py-8 rounded-[32px] border-2 transition-all active:scale-95 group ${disabled ? 'bg-white/5 border-white/5 text-white/20' : 'bg-white/5 border-white/10 hover:border-white/30 text-white'}`}
            style={!disabled ? { borderLeftColor: `hsl(${color})`, borderLeftWidth: '4px' } : {}}
        >
            <div className="transition-transform group-hover:scale-110" style={{ color: !disabled ? `hsl(${color})` : 'inherit' }}>{icon}</div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{label}</span>
            {status === 'error' && <span className="text-[8px] text-red-500 font-black mt-2 uppercase tracking-widest animate-pulse">!! Handshake_Failed !!</span>}
        </button>
    );
}