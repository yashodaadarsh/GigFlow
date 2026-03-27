import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/api';

const STAGES = ['ASSIGNED', 'ONGOING', 'COMPLETED', 'PAYMENT_PENDING', 'DELIVERED'];
const STAGE_LABELS = {
    ASSIGNED:        { label: 'Assigned',        icon: '📋', color: 'blue' },
    ONGOING:         { label: 'Ongoing',          icon: '🚀', color: 'indigo' },
    COMPLETED:       { label: 'Work Completed',   icon: '✅', color: 'purple' },
    PAYMENT_PENDING: { label: 'Payment',          icon: '💳', color: 'yellow' },
    DELIVERED:       { label: 'Delivered',        icon: '🏁', color: 'green' },
};

const PAYMENT_URL = 'http://localhost:5001';

export default function ProjectPipeline() {
    const { gigId } = useParams();
    const navigate = useNavigate();
    const { user, token } = useSelector(state => state.auth);

    const [gig, setGig] = useState(null);
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const currentRole = (user?.role || '').toUpperCase();
    const isHirer = currentRole === 'HIRER';

    const fetchGig = async () => {
        try {
            const { data } = await api.get(`/gigs/${gigId}`);
            setGig(data);
        } catch (err) { console.error(err); }
    };

    const fetchPayment = async () => {
        try {
            const res = await fetch(`${PAYMENT_URL}/api/payments/gig/${gigId}`);
            const data = await res.json();
            setPayment(data);
        } catch {}
    };

    useEffect(() => {
        if (!user) return navigate('/login');
        Promise.all([fetchGig(), fetchPayment()]).finally(() => setLoading(false));
    }, [gigId, user]);

    const advanceStage = async (newStatus) => {
        setActionLoading(true);
        try {
            await api.put(`/gigs/${gigId}/status?status=${newStatus}`);
            await fetchGig();
            setStatusMsg(`Status updated to ${newStatus}`);
        } catch (err) {
            setStatusMsg('Failed to update status');
        } finally { setActionLoading(false); }
    };

    const initiatePayment = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`${PAYMENT_URL}/api/payments/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gigId: gig.id,
                    hirerId: user.id,
                    bidderId: gig.hiredBidderId,
                    amount: gig.budget,
                    token,
                }),
            });
            const order = await res.json();

            if (order.mock) {
                // Mock mode — auto-verify
                setStatusMsg('Mock payment mode: auto-completing...');
                await verifyMockPayment(order);
                return;
            }

            // Load Razorpay checkout
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            document.body.appendChild(script);
            script.onload = () => {
                const rzp = new window.Razorpay({
                    key: order.key,
                    amount: order.amount,
                    currency: order.currency,
                    order_id: order.orderId,
                    name: 'GigFlow',
                    description: `Payment for: ${gig.title}`,
                    handler: async (response) => {
                        await fetch(`${PAYMENT_URL}/api/payments/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                gigId: gig.id,
                                hirerId: user.id,
                                bidderId: gig.hiredBidderId,
                                token,
                            }),
                        });
                        await fetchGig();
                        await fetchPayment();
                        setStatusMsg('🎉 Payment successful! Project delivered.');
                    },
                });
                rzp.open();
            };
        } catch (err) {
            setStatusMsg('Payment initiation failed: ' + err.message);
        } finally { setActionLoading(false); }
    };

    const verifyMockPayment = async (order) => {
        try {
            await fetch(`${PAYMENT_URL}/api/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpayOrderId: order.orderId,
                    razorpayPaymentId: `mock_pay_${Date.now()}`,
                    razorpaySignature: 'mock',
                    gigId: gig.id,
                    hirerId: user.id,
                    bidderId: gig.hiredBidderId,
                    token,
                    mock: true,
                }),
            });
            await fetchGig();
            await fetchPayment();
            setStatusMsg('🎉 Mock payment complete! Project delivered.');
        } finally { setActionLoading(false); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!gig) return <div className="text-center py-20 text-gray-400">Gig not found.</div>;

    const currentStageIdx = STAGES.indexOf(gig.status);
    const peerId = isHirer ? gig.hiredBidderId : gig.hirerId;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-2">
                        ← Dashboard
                    </button>
                    <span className="text-xs text-gray-400 bg-white border px-3 py-1 rounded-full">Gig #{gig.id}</span>
                </div>

                {/* Gig Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{gig.title}</h1>
                    <p className="text-gray-500 text-sm mb-4">{gig.description}</p>
                    <div className="flex gap-4 text-sm">
                        <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full">${gig.budget}</span>
                        {gig.deadline && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">Due: {new Date(gig.deadline).toLocaleDateString()}</span>}
                    </div>
                </div>

                {/* ===== Pipeline Progress ===== */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Project Pipeline</h2>
                    <div className="relative flex items-center justify-between">
                        {/* Progress bar track */}
                        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0">
                            <div
                                className="h-full bg-indigo-500 transition-all duration-500"
                                style={{ width: currentStageIdx >= 0 ? `${(currentStageIdx / (STAGES.length - 1)) * 100}%` : '0%' }}
                            />
                        </div>
                        {STAGES.map((stage, idx) => {
                            const done = idx < currentStageIdx;
                            const active = idx === currentStageIdx;
                            const info = STAGE_LABELS[stage];
                            return (
                                <div key={stage} className="flex flex-col items-center z-10 relative">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                                        active ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110'
                                            : done ? 'bg-green-500 border-green-500 text-white'
                                            : 'bg-white border-gray-300 text-gray-400'
                                    }`}>
                                        {done ? '✓' : info.icon}
                                    </div>
                                    <span className={`text-xs font-semibold mt-2 text-center max-w-16 leading-tight ${active ? 'text-indigo-700' : done ? 'text-green-700' : 'text-gray-400'}`}>
                                        {info.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ===== Communication Panel ===== */}
                {peerId && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Communication</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate(`/chat/${peerId}`)}
                                className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-4 rounded-xl font-bold transition shadow-lg shadow-indigo-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                Chat
                            </button>
                            <button
                                onClick={() => navigate(`/video-call/${peerId}`)}
                                className="flex items-center justify-center gap-3 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 px-5 py-4 rounded-xl font-bold transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                Video Call
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== Stage Actions ===== */}
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                    <h2 className="text-lg font-bold text-gray-800">Actions</h2>

                    {statusMsg && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium">
                            {statusMsg}
                        </div>
                    )}

                    {/* ASSIGNED → ONGOING: Hirer starts work */}
                    {gig.status === 'ASSIGNED' && isHirer && (
                        <button
                            onClick={() => advanceStage('ONGOING')}
                            disabled={actionLoading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold disabled:opacity-50"
                        >
                            🚀 Start Work (Mark as Ongoing)
                        </button>
                    )}

                    {/* ONGOING → COMPLETED: Either party can mark done */}
                    {gig.status === 'ONGOING' && (
                        <button
                            onClick={() => advanceStage('COMPLETED')}
                            disabled={actionLoading}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold disabled:opacity-50"
                        >
                            ✅ Mark Work as Completed
                        </button>
                    )}

                    {/* COMPLETED → PAYMENT: Hirer initiates payment */}
                    {gig.status === 'COMPLETED' && isHirer && (
                        <button
                            onClick={initiatePayment}
                            disabled={actionLoading}
                            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold disabled:opacity-50"
                        >
                            💳 {actionLoading ? 'Processing...' : `Pay ₹${gig.budget} via Razorpay`}
                        </button>
                    )}

                    {gig.status === 'COMPLETED' && !isHirer && (
                        <div className="text-center text-gray-500 text-sm py-3 border border-dashed border-gray-200 rounded-xl">
                            ⏳ Waiting for hirer to complete payment...
                        </div>
                    )}

                    {/* DELIVERED */}
                    {gig.status === 'DELIVERED' && (
                        <div className="text-center py-6">
                            <div className="text-5xl mb-3">🏁</div>
                            <p className="font-extrabold text-xl text-green-700">Project Delivered!</p>
                            <p className="text-gray-500 text-sm mt-1">Payment received and project successfully completed.</p>
                            {payment && payment.razorpay_payment_id && (
                                <p className="text-xs text-gray-400 mt-2">Payment ID: {payment.razorpay_payment_id}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
