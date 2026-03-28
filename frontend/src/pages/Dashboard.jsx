import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/auth.slice';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export default function Dashboard() {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [gigs, setGigs] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [skillsString, setSkillsString] = useState('');
    const [budget, setBudget] = useState('');
    const [deadline, setDeadline] = useState('');
    const [notifications, setNotifications] = useState([]);  // { type, message, hirerId, roomId, callerId } 
    const [bids, setBids] = useState({});
    const [recommendations, setRecommendations] = useState({});
    const [biddedGigs, setBiddedGigs] = useState([]);
    const [bidderNames, setBidderNames] = useState({});
    const [hiringGig, setHiringGig] = useState(null); // { gigId, bidderId } loading state

    // Bidder Modal State
    const [bidModalOpen, setBidModalOpen] = useState(false);
    const [selectedGigId, setSelectedGigId] = useState(null);
    const [bidProposal, setBidProposal] = useState('');
    const [bidAmount, setBidAmount] = useState('');

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const fetchGigs = async () => {
        try {
            const endpoint = user.role === 'HIRER' ? '/gigs/my-gigs' : '/gigs';
            const { data } = await api.get(endpoint);
            setGigs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch gigs', err);
        }
    };

    const fetchBids = async (gigId) => {
        try {
            const { data } = await api.get(`/gigs/${gigId}/bids`);
            setBids(prev => ({ ...prev, [gigId]: data }));

            // Fetch bidder names via Vite proxy → auth-service
            const ids = [...new Set(data.map(b => b.bidderId))].join(',');
            if (ids) {
                const { data: profiles } = await api.get(`/auth/users?ids=${ids}`);
                const nameMap = {};
                profiles.forEach(p => { nameMap[p.id] = p.name; });
                setBidderNames(prev => ({ ...prev, ...nameMap }));
            }
        } catch (err) {
            console.error('Failed to fetch bids for gig', gigId, err);
        }
    };

    const fetchRecommendations = async (gigId) => {
        try {
            const { data } = await api.get(`/gigs/${gigId}/recommendations`);
            setRecommendations(prev => ({ ...prev, [gigId]: data }));
        } catch (err) {
            console.error('Failed to fetch ML recommendations', err);
            alert('Failed to load AI recommendations.');
        }
    };

    const fetchBiddedGigs = async () => {
        if (user?.role !== 'BIDDER') return;
        try {
            const { data } = await api.get('/gigs/my-bids');
            setBiddedGigs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch bidded gigs', err);
        }
    };

    const hireForGig = async (gigId, bidderId) => {
        setHiringGig({ gigId, bidderId });
        try {
            await api.post(`/gigs/${gigId}/hire/${bidderId}`);
            // Navigate directly to the gig pipeline
            navigate(`/gig-pipeline/${gigId}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Hire action failed');
        } finally { setHiringGig(null); }
    };

    useEffect(() => {
        if (!user) return navigate('/login');
        fetchGigs();
        fetchBiddedGigs();

        // Both HIRER and BIDDER subscribe to their notification channel via STOMP
        let stompClient = null;
        const socket = new SockJS('http://localhost:8083/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, () => {
            stompClient.subscribe(`/topic/notifications/${user.id}`, (msg) => {
                try {
                    // Try to parse JSON notification payload (from communication service)
                    const parsed = JSON.parse(msg.body);
                    // parsed may itself be a JSON string if double-encoded
                    const notif = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
                    setNotifications(prev => [{ ...notif, ts: Date.now() }, ...prev]);
                } catch {
                    setNotifications(prev => [{ type: 'INFO', message: msg.body, ts: Date.now() }, ...prev]);
                }
            });
        });

        return () => { if (stompClient) stompClient.disconnect(); };
    }, [user, navigate]);

    const handlePostGig = async (e) => {
        e.preventDefault();
        try {
            let formattedDeadline = deadline;
            if (deadline) {
                const d = new Date(deadline);
                if (!isNaN(d.getTime())) {
                    formattedDeadline = d.toISOString().slice(0, 16); // Extract YYYY-MM-DDThh:mm
                }
            }

            const payload = {
                title,
                description,
                skillsRequired: skillsString.split(',').map(s => s.trim()),
                budget: parseFloat(budget),
                deadline: formattedDeadline || null
            };
            await api.post('/gigs', payload);
            fetchGigs();
            setTitle(''); setDescription(''); setSkillsString(''); setBudget(''); setDeadline('');
            alert('Gig posted successfully!');
        } catch (err) {
            alert('Failed to post gig');
        }
    };

    const openBidModal = (gigId) => {
        setSelectedGigId(gigId);
        setBidProposal('');
        setBidAmount('');
        setBidModalOpen(true);
    };

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        if (!bidProposal || !bidAmount) return;

        try {
            await api.post(`/gigs/${selectedGigId}/bids`, { proposal: bidProposal, budget: parseFloat(bidAmount) });
            alert('Bid submitted successfully!');
            setBidModalOpen(false);
            fetchBiddedGigs();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit bid');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white shadow-lg rounded-2xl p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h2>
                        <p className="text-sm text-gray-500 mt-1">Logged in as <span className="font-semibold text-blue-600">{user?.name} ({user?.role})</span></p>
                    </div>
                    <button onClick={handleLogout} className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-medium rounded-lg transition-colors border border-red-200 shadow-sm">
                        Logout
                    </button>
                </div>

                {/* ===== SMART NOTIFICATION PANEL (Both Roles) ===== */}
                {notifications.length > 0 && (
                    <div className="space-y-2">
                        {notifications.slice(0, 5).map((notif, i) => (
                            <div key={i} className={`rounded-xl px-5 py-4 flex items-center justify-between shadow-sm border ${
                                notif.type === 'INCOMING_VIDEO_CALL'
                                    ? 'bg-pink-50 border-pink-200 text-pink-800'
                                    : notif.type === 'CHAT_REQUEST' || notif.type === 'NEW_MESSAGE'
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                                        : 'bg-blue-50 border-blue-200 text-blue-800'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">
                                        {notif.type === 'INCOMING_VIDEO_CALL' ? '📹' : notif.type === 'CHAT_REQUEST' ? '💬' : notif.type === 'NEW_MESSAGE' ? '✉️' : '🔔'}
                                    </span>
                                    <span className="font-semibold text-sm">{notif.message}</span>
                                </div>
                                <div className="flex gap-2 ml-4 flex-shrink-0">
                                    {/* Chat action */}
                                    {(notif.type === 'CHAT_REQUEST' || notif.type === 'NEW_MESSAGE') && notif.hirerId && (
                                        <button
                                            onClick={() => navigate(`/chat/${notif.hirerId}`)}
                                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold transition"
                                        >Open Chat</button>
                                    )}
                                    {/* Video call action */}
                                    {notif.type === 'INCOMING_VIDEO_CALL' && notif.callerId && (
                                        <button
                                            onClick={() => navigate(`/video-call/${notif.callerId}`)}
                                            className="text-xs bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 rounded-lg font-bold transition"
                                        >Join Call</button>
                                    )}
                                    <button
                                        onClick={() => setNotifications(prev => prev.filter((_, idx) => idx !== i))}
                                        className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                                    >✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white shadow-lg rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                                {user?.role === 'HIRER' ? 'My Posted Gigs' : 'Open Gigs to Bid'}
                            </h3>

                            {gigs.length === 0 ? (
                                <p className="text-gray-500 italic py-4">No gigs found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {gigs.map(gig => (
                                        <div key={gig.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-gray-50 group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{gig.title}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{gig.description}</p>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {gig.skillsRequired?.map(skill => (
                                                            <span key={skill} className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">{skill}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-green-600">${gig.budget}</div>
                                                    <div className="text-xs text-gray-500 mt-1">Status: <span className="font-semibold text-gray-700">{gig.status}</span></div>
                                                    {user?.role === 'BIDDER' && gig.status === 'OPEN' && (
                                                        <button onClick={() => openBidModal(gig.id)} className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition">Place Bid</button>
                                                    )}
                                                    {user?.role === 'HIRER' && (
                                                        <div className="flex flex-col gap-2 mt-3 items-end">
                                                            <button onClick={() => fetchBids(gig.id)} className="px-4 py-1.5 bg-gray-800 text-white text-sm font-semibold rounded hover:bg-gray-900 transition">View Bids</button>
                                                            <button onClick={() => fetchRecommendations(gig.id)} className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded shadow hover:bg-indigo-700 transition flex items-center gap-2">
                                                                🪄 AI Recommends
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* AI Recommendations Panel */}
                                            {recommendations[gig.id] && recommendations[gig.id].length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-indigo-200 bg-indigo-50 p-4 rounded-lg">
                                                    <h5 className="font-bold text-sm mb-3 text-indigo-900 flex items-center gap-2">
                                                        <span className="text-xl">✨</span> Top Match Candidates
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {recommendations[gig.id].map((rec, idx) => (
                                                            <div key={rec.bidderId} className="bg-white p-3 rounded border border-indigo-100 shadow-sm flex justify-between items-center">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-bold text-gray-500 text-sm">#{idx + 1}</span>
                                                                    <div>
                                                                        <div className="font-semibold text-gray-900">
                                                                            {rec.bidderName || `Bidder #${rec.bidderId}`}
                                                                        </div>
                                                                        <Link
                                                                            to={`/profile/${rec.bidderId}`}
                                                                            className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline"
                                                                        >
                                                                            View Profile →
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                                <div className="text-indigo-600 font-bold bg-indigo-100 px-3 py-1 rounded-full text-xs">
                                                                    Score: {(rec.score * 100).toFixed(1)}%
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Bids Panel for Hirer */}
                                            {bids[gig.id] && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <h5 className="font-semibold text-sm mb-2 text-gray-800">Submitted Bids:</h5>
                                                    <div className="space-y-2">
                                                        {bids[gig.id].length === 0 ? <p className="text-xs text-gray-500">No bids yet.</p> : bids[gig.id].map(bid => (
                                                            <div key={bid.id} className="bg-white p-3 rounded border text-sm flex justify-between">
                                                                <div>
                                                                    <span className="font-semibold text-gray-900">{bidderNames[bid.bidderId] || `Bidder #${bid.bidderId}`}</span>
                                                                    <Link to={`/profile/${bid.bidderId}`} className="text-xs text-indigo-500 hover:underline ml-2">View Profile →</Link>
                                                                     <p className="text-gray-600 mt-1">{bid.proposal}</p>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <div className="text-green-600 font-bold">${bid.budget}</div>
                                                                    <button
                                                                        onClick={() => hireForGig(gig.id, bid.bidderId)}
                                                                        disabled={hiringGig?.gigId === gig.id && hiringGig?.bidderId === bid.bidderId}
                                                                        className="text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-bold transition"
                                                                    >
                                                                        {hiringGig?.gigId === gig.id && hiringGig?.bidderId === bid.bidderId ? 'Hiring...' : '✓ Hire'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Biddings section for bidders */}
                            {user?.role === 'BIDDER' && (
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">My Bidded Gigs</h3>
                                    {biddedGigs.length === 0 ? (
                                        <p className="text-gray-500 italic py-4">You haven't placed any bids yet.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {biddedGigs.map(gig => {
                                                const statusColors = {
                                                    PENDING:     'bg-yellow-100 text-yellow-800 border-yellow-200',
                                                    SHORTLISTED: 'bg-blue-100 text-blue-800 border-blue-200',
                                                    ACCEPTED:    'bg-green-100 text-green-800 border-green-200',
                                                    REJECTED:    'bg-red-100 text-red-700 border-red-200',
                                                    ONGOING:     'bg-indigo-100 text-indigo-800 border-indigo-200',
                                                    COMPLETED:   'bg-gray-100 text-gray-700 border-gray-200',
                                                };
                                                const statusIcons = {
                                                    PENDING: '⏳', SHORTLISTED: '⭐', ACCEPTED: '✅',
                                                    REJECTED: '❌', ONGOING: '🚀', COMPLETED: '🏁',
                                                };
                                                const statusClass = statusColors[gig.status] || 'bg-gray-100 text-gray-600 border-gray-200';
                                                return (
                                                    <div key={gig.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-white group">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{gig.title}</h4>
                                                                <p className="text-sm text-gray-600 mt-1">{gig.description}</p>
                                                                <div className="mt-3 flex flex-wrap gap-2">
                                                                    {gig.skillsRequired?.map(skill => (
                                                                        <span key={skill} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">{skill}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="text-right ml-4 flex flex-col items-end gap-2">
                                                                <div className="text-xl font-bold text-green-700">${gig.budget}</div>
                                                                <span className={`border text-xs font-bold px-3 py-1 rounded-full ${statusClass}`}>
                                                                    {statusIcons[gig.status] || '📋'} {gig.status || 'UNKNOWN'}
                                                                </span>
                                                                {/* Chat with Hirer button - visible when accepted/ongoing */}
                                                                {(gig.status === 'ACCEPTED' || gig.status === 'ONGOING' || gig.status === 'ASSIGNED' || gig.status === 'COMPLETED' || gig.status === 'PAYMENT_PENDING' || gig.status === 'DELIVERED') && gig.hirerId && (
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => navigate(`/gig-pipeline/${gig.id}`)}
                                                                            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
                                                                        >
                                                                            📈 View Pipeline
                                                                        </button>
                                                                        <button
                                                                            onClick={() => navigate(`/chat/${gig.hirerId}`)}
                                                                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                                            Chat
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar / Forms Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        {user?.role === 'HIRER' && (
                            <div className="bg-white shadow-lg rounded-2xl p-6 sticky top-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Post a New Gig</h3>
                                <form onSubmit={handlePostGig} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Need React Developer" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea required value={description} onChange={e => setDescription(e.target.value)} rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Gig details..."></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                                        <input required value={skillsString} onChange={e => setSkillsString(e.target.value)} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="React, Node.js, TailWind" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                                            <input required value={budget} onChange={e => setBudget(e.target.value)} type="number" min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="1000" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                            <input required value={deadline} onChange={e => setDeadline(e.target.value)} type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-sm">
                                        Publish Gig
                                    </button>
                                </form>
                            </div>
                        )}

                        {user?.role === 'BIDDER' && (
                            <div className="bg-white shadow-lg rounded-2xl p-6 sticky top-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Profile Stats</h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Gigs Completed</span>
                                        <span className="font-bold text-gray-900">0</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Rating</span>
                                        <span className="font-bold text-gray-900">N/A</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bid Modal */}
            {bidModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg m-4">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Submit Your Bid</h3>
                        <form onSubmit={handleBidSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proposal / Cover Letter</label>
                                <textarea required rows="4" value={bidProposal} onChange={e => setBidProposal(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Why are you the best fit for this gig..."></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Budget ($)</label>
                                <input required type="number" min="1" value={bidAmount} onChange={e => setBidAmount(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 500" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setBidModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded-lg transition-colors">Submit Bid</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
