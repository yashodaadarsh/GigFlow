import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/api';
import { 
    Activity, CheckCircle, Clock, CreditCard, 
    Rocket, Clipboard, ArrowLeft, DollarSign,
    Shield, Cpu, Zap, MessageSquare, Video
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/Layout/DashboardLayout';

const STAGES = ['ASSIGNED', 'ONGOING', 'COMPLETED', 'PAYMENT_PENDING', 'DELIVERED'];
const STAGE_LABELS = {
    ASSIGNED:        { label: 'Initialization',   icon: <Clipboard size={18} />, color: 'var(--accent-color)' },
    ONGOING:         { label: 'Active_Execution', icon: <Activity size={18} />, color: 'var(--success)' },
    COMPLETED:       { label: 'Work_Validated',   icon: <CheckCircle size={18} />, color: 'var(--warning)' },
    PAYMENT_PENDING: { label: 'Settlement',       icon: <CreditCard size={18} />, color: 'var(--accent-color)' },
    DELIVERED:       { label: 'Closing_Node',     icon: <Rocket size={18} />, color: 'var(--success)' },
};

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
            const { data } = await api.get(`/payments/gig/${gigId}`);
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
            setStatusMsg(`Status_Update_Success: ${newStatus}`);
        } catch (err) {
            setStatusMsg('Handshake_Failed: Unable to update status');
        } finally { setActionLoading(false); }
    };

    const initiatePayment = async () => {
        setActionLoading(true);
        try {
            const { data: order } = await api.post('/payments/create-order', {
                gigId: gig.id,
                hirerId: user.id,
                bidderId: gig.hiredBidderId,
                amount: gig.budget,
                token,
            });
            if (order.mock) {
                setStatusMsg('Mock_Payment_Protocol: Executing...');
                await verifyMockPayment(order);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            document.body.appendChild(script);
            script.onload = () => {
                const rzp = new window.Razorpay({
                    key: order.key,
                    amount: order.amount,
                    currency: order.currency,
                    order_id: order.orderId,
                    name: 'GigFlow_Terminal',
                    description: `Settlement for: ${gig.title}`,
                    handler: async (response) => {
                        await api.post('/payments/verify', {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            gigId: gig.id,
                            hirerId: user.id,
                            bidderId: gig.hiredBidderId,
                            token,
                        });
                        await fetchGig();
                        await fetchPayment();
                        setStatusMsg('🎉 Settlement_Complete: Node Delivered.');
                    },
                });
                rzp.open();
            };
        } catch (err) {
            setStatusMsg('Settlement_Failed: ' + err.message);
        } finally { setActionLoading(false); }
    };

    const verifyMockPayment = async (order) => {
        try {
            await api.post('/payments/verify', {
                razorpayOrderId: order.orderId,
                razorpayPaymentId: `mock_pay_${Date.now()}`,
                razorpaySignature: 'mock',
                gigId: gig.id,
                hirerId: user.id,
                bidderId: gig.hiredBidderId,
                token,
                mock: true,
            });
            await fetchGig();
            await fetchPayment();
            setStatusMsg('🎉 Mock_Settlement_Success: Node Delivered.');
        } finally { setActionLoading(false); }
    };

    if (loading) return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-2xl shadow-indigo-500/20" />
        </div>
    );

    if (!gig) return <div className="text-center py-20 text-white/20 font-black uppercase tracking-[0.3em]">Gig_Node_Null</div>;

    const currentStageIdx = STAGES.indexOf(gig.status);
    const peerId = isHirer ? gig.hiredBidderId : gig.hirerId;

    return (
        <DashboardLayout>
            <div className="space-y-10 max-w-5xl mx-auto pb-20">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 text-white/30 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> [ Return_To_Terminal ]
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 glass border border-white/10 rounded-xl text-[9px] font-black text-white/40 uppercase tracking-widest">TRANSMISSION_REF: {gig.id}</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                    </div>
                </div>

                {/* Gig Info Console */}
                <div className="glass-card p-12 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                            <div className="flex-1">
                                <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic text-gradient mb-4 leading-none">{gig.title}</h1>
                                <p className="text-white/40 font-medium max-w-2xl italic leading-relaxed text-sm">{"> "} {gig.description}</p>
                            </div>
                            <div className="text-left md:text-right shrink-0">
                                <div className="text-5xl font-black text-white mb-4 flex items-center gap-3 glow-primary">
                                    <DollarSign size={24} className="text-white/20" />
                                    {gig.budget}
                                </div>
                                {gig.deadline && (
                                    <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest justify-start md:justify-end">
                                        <Clock size={12} /> Target_Delivery: {new Date(gig.deadline).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
                </div>

                {/* Pipeline Progress Vis */}
                <div className="glass-card p-12">
                    <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-12 flex items-center gap-3">
                        <Cpu size={14} className="text-indigo-500" /> Pipeline_Transmission_Vector
                    </h2>
                    <div className="relative flex items-center justify-between">
                        {/* Progress track */}
                        <div className="absolute top-6 left-2 right-2 h-[2px] bg-white/5 z-0">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: currentStageIdx >= 0 ? `${(currentStageIdx / (STAGES.length - 1)) * 100}%` : '0%' }}
                                className="h-full bg-indigo-500 shadow-[0_0_15px_hsla(var(--accent-color)_/_0.5)]"
                            />
                        </div>
                        {STAGES.map((stage, idx) => {
                            const done = idx < currentStageIdx;
                            const active = idx === currentStageIdx;
                            const info = STAGE_LABELS[stage];
                            return (
                                <div key={stage} className="flex flex-col items-center z-10 relative">
                                    <motion.div 
                                        initial={false}
                                        animate={{
                                            scale: active ? 1.2 : 1,
                                            backgroundColor: active ? 'hsl(var(--accent-color))' : done ? 'hsl(var(--success))' : 'rgba(255,255,255,0.05)',
                                            borderColor: active || done ? 'transparent' : 'rgba(255,255,255,0.1)'
                                        }}
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-2xl"
                                    >
                                        <div className={active || done ? 'text-black' : 'text-white/20'}>
                                            {done ? <CheckCircle size={20} /> : info.icon}
                                        </div>
                                    </motion.div>
                                    <span className={`text-[9px] font-black mt-4 text-center max-w-[80px] uppercase tracking-widest leading-tight transition-colors ${active ? 'text-white' : done ? 'text-green-500' : 'text-white/20'}`}>
                                        {info.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Communication Panel */}
                    {peerId && (
                        <div className="glass-card p-10">
                            <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                <MessageSquare size={14} className="text-indigo-500" /> Identity_Uplink
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <button
                                    onClick={() => navigate(`/chat/${peerId}`)}
                                    className="flex flex-col items-center justify-center gap-4 py-8 bg-white/5 hover:bg-white/10 text-white rounded-3xl border border-white/5 transition-all group active:scale-95"
                                >
                                    <MessageSquare size={20} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Secure_Chat</span>
                                </button>
                                <button
                                    onClick={() => navigate(`/video-call/${peerId}`)}
                                    className="flex flex-col items-center justify-center gap-4 py-8 bg-white/5 hover:bg-white/10 text-white rounded-3xl border border-white/5 transition-all group active:scale-95"
                                >
                                    <Video size={20} className="text-pink-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Hologram_Link</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Directives */}
                    <div className="glass-card p-10 space-y-8">
                        <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                            <Zap size={14} className="text-indigo-500" /> Executive_Directives
                        </h2>

                        {statusMsg && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/5 border border-indigo-500/30 text-indigo-400 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl"
                            >
                                <Activity size={14} className="animate-pulse" /> {statusMsg}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            {/* ASSIGNED → ONGOING */}
                            {gig.status === 'ASSIGNED' && isHirer && (
                                <button
                                    onClick={() => advanceStage('ONGOING')}
                                    disabled={actionLoading}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    🚀 Initialize_Execution
                                </button>
                            )}

                            {/* ONGOING → COMPLETED */}
                            {gig.status === 'ONGOING' && isHirer && (
                                <button
                                    onClick={() => advanceStage('COMPLETED')}
                                    disabled={actionLoading}
                                    className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-green-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    ✅ Validate_Completion
                                </button>
                            )}

                            {/* Bidders view */}
                            {(gig.status === 'ASSIGNED' || gig.status === 'ONGOING' || gig.status === 'COMPLETED') && !isHirer && (
                                <div className="text-center py-6 glass rounded-[2rem] border-dashed border-white/5">
                                    <p className="text-white/20 font-black uppercase tracking-[0.2em] italic text-[10px]">
                                        {gig.status === 'ASSIGNED' && '⌛ Synchronizing Identity_Link: Waiting for initialization...'}
                                        {gig.status === 'ONGOING' && '🚀 Execution_Active: System is online...'}
                                        {gig.status === 'COMPLETED' && '⏳ Validation_Success: Waiting for settlement settlement...'}
                                    </p>
                                </div>
                            )}

                            {/* COMPLETED → PAYMENT */}
                            {gig.status === 'COMPLETED' && isHirer && (
                                <button
                                    onClick={initiatePayment}
                                    disabled={actionLoading}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    💳 {actionLoading ? 'Processing_Uplink...' : `Execute_Settlement: ₹${gig.budget}`}
                                </button>
                            )}

                            {/* DELIVERED */}
                            {gig.status === 'DELIVERED' && (
                                <div className="text-center py-10 relative overflow-hidden text-neutral-400 font-bold glass rounded-[2rem]">
                                    <div className="text-5xl mb-4 group-hover:rotate-12 transition-transform">🏁</div>
                                    <p className="font-black text-2xl text-white uppercase italic tracking-tighter">Transmission_Delivered</p>
                                    <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mt-2">Node successfully closed & settled.</p>
                                    {payment && payment.razorpay_payment_id && (
                                        <p className="text-[8px] text-white/10 font-black mt-4 uppercase tracking-widest">TX_ID: {payment.razorpay_payment_id}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
