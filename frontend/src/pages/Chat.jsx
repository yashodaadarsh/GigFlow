import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Video, ArrowLeft, Send, Activity, ShieldCheck, Cpu } from 'lucide-react';
import api from '../api/api';

export default function Chat() {
    const { nodeId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [room, setRoom] = useState(null);
    const [bidderProfile, setBidderProfile] = useState(null);
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);
    const bottomRef = useRef(null);

    const currentRole = (user?.role || '').toUpperCase();
    const isHirer = currentRole === 'HIRER';
    const actualHirerId = isHirer ? user?.id : nodeId;
    const actualBidderId = isHirer ? nodeId : user?.id;

    useEffect(() => {
        if (!nodeId) return;
        api.get(`/auth/profile/${nodeId}`)
            .then(res => setBidderProfile(res.data))
            .catch(err => console.error('PROFILE_SYNC_ERR', err));
    }, [nodeId]);

    useEffect(() => {
        if (!user || !nodeId) return;
        api.post('/chat/rooms', {
            gig_id: 0,
            hirer_id: actualHirerId,
            bidder_id: actualBidderId,
        })
            .then(res => {
                setRoom(res.data);
                return api.get(`/chat/rooms/${res.data.id}/messages`);
            })
            .then(res => setMessages(res.data))
            .catch(err => console.error('ROOM_INIT_ERR', err));
    }, [user, nodeId]);

    useEffect(() => {
        if (!room) return;
        const socket = io();
        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            socket.emit('join-room', room.id, user.id);
        });

        socket.on('receive-message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('disconnect', () => setConnected(false));
        return () => { socket.disconnect(); };
    }, [room]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socketRef.current || !room) return;
        socketRef.current.emit('send-message', {
            room_id: room.id,
            sender_id: user.id,
            content: input.trim(),
        });
        setInput('');
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center py-12 px-4 relative overflow-hidden font-sans">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
            />

            <div className="w-full max-w-3xl flex flex-col relative z-10" style={{ height: '85vh' }}>

                {/* 1. Terminal Header */}
                <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 mb-4 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-[#10b981] transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-4 border-l border-white/5 pl-6">
                            <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] font-black italic">
                                {bidderProfile?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                                <div className="text-xs font-black text-white uppercase tracking-tighter italic">
                                    NODE_{bidderProfile?.name?.replace(/\s+/g, '_').toUpperCase() || 'UNKNOWN'}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Activity size={10} className={connected ? 'text-[#10b981] animate-pulse' : 'text-red-500'} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                                        {connected ? 'Sync_Established' : 'Link_Lost'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/video-call/${nodeId}`)}
                        className="bg-transparent border border-[#22d3ee]/30 hover:bg-[#22d3ee]/10 text-[#22d3ee] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <Video size={14} /> Establish_Video_Link
                    </button>
                </div>

                {/* 2. Message Feed (Encrypted Style) */}
                <div className="flex-1 bg-[#0F0F10] border border-white/5 rounded-2xl p-6 overflow-y-auto flex flex-col gap-6 scrollbar-hide">
                    {messages.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                            <Terminal size={48} className="text-[#10b981] mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting_First_Transmission...</p>
                        </div>
                    )}

                    {messages.map((msg, i) => {
                        const isMine = String(msg.sender_id) === String(user?.id);
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, x: isMine ? 10 : -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-md px-5 py-3 rounded-xl relative group ${isMine
                                        ? 'bg-[#10b981]/10 border border-[#10b981]/20 text-white'
                                        : 'bg-white/[0.03] border border-white/5 text-gray-300'
                                    }`}>
                                    {/* Security Marker */}
                                    <div className={`absolute top-0 ${isMine ? 'right-0 -mr-1' : 'left-0 -ml-1'} w-1 h-full rounded-full ${isMine ? 'bg-[#10b981]' : 'bg-gray-700'}`} />

                                    <p className="text-sm font-medium leading-relaxed tracking-tight">
                                        <span className="text-gray-600 mr-2 font-mono">{">"}</span>
                                        {msg.content}
                                    </p>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                        <span className="text-[8px] font-black text-gray-600 uppercase">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <ShieldCheck size={10} className="text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* 3. Input Console */}
                <form onSubmit={sendMessage} className="mt-4 flex gap-4 relative">
                    <div className="flex-1 relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                            <Cpu size={16} />
                        </div>
                        <input
                            className="w-full bg-[#111111] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white font-bold focus:outline-none focus:border-[#10b981] transition-all placeholder:text-gray-800"
                            placeholder="Type_Message_Transmission..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!connected || !input.trim()}
                        className="bg-[#10b981] hover:bg-white disabled:opacity-30 text-[#0A0A0B] px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-[#10b981]/10 transition-all active:scale-95"
                    >
                        [ Send ]
                    </button>
                </form>
            </div>

            {/* Status Metadata */}
            <div className="mt-6 flex gap-8 opacity-20">
                <div className="text-[8px] font-black text-white uppercase tracking-widest">Protocol: Socket_IO_v4</div>
                <div className="text-[8px] font-black text-white uppercase tracking-widest">Encryption: AES_256_GCM</div>
                <div className="text-[8px] font-black text-[#10b981] uppercase tracking-widest">Mesh_Identity: {user?.id}</div>
            </div>
        </div>
    );
}