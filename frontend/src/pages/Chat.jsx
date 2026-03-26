import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const COMM_URL = 'http://localhost:5000';

export default function Chat() {
    const { bidderId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [room, setRoom] = useState(null);
    const [bidderProfile, setBidderProfile] = useState(null);
    const [connected, setConnected] = useState(false);
    const [gigId, setGigId] = useState(null);
    const socketRef = useRef(null);
    const bottomRef = useRef(null);

    // Fetch bidder profile for display
    useEffect(() => {
        fetch(`http://localhost:8081/api/auth/profile/${bidderId}`)
            .then(r => r.json())
            .then(setBidderProfile)
            .catch(console.error);
    }, [bidderId]);

    // Determine who is hirer and who is bidder in this chat
    // If current user is HIRER: they chat with bidderId from params
    // If current user is BIDDER: bidderId param is actually the hirerId
    const currentRole = (user?.role || '').toUpperCase();
    const isHirer = currentRole === 'HIRER';
    const actualHirerId = isHirer ? user?.id : bidderId;
    const actualBidderId = isHirer ? bidderId : user?.id;

    // Get or create a chat room
    useEffect(() => {
        if (!user) return;
        fetch(`${COMM_URL}/api/chat/rooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gig_id: 0,
                hirer_id: actualHirerId,
                bidder_id: actualBidderId,
                hirer_name: isHirer ? user.name : undefined,
            }),
        })
            .then(r => r.json())
            .then(roomData => {
                setRoom(roomData);
                return fetch(`${COMM_URL}/api/chat/rooms/${roomData.id}/messages`);
            })
            .then(r => r.json())
            .then(setMessages)
            .catch(console.error);
    }, [user, bidderId]);

    // Connect Socket.io once we have a room
    useEffect(() => {
        if (!room) return;

        const socket = io(COMM_URL);
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

    // Auto-scroll to bottom
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

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center py-8 px-4">
            <div className="w-full max-w-2xl flex flex-col" style={{ height: '85vh' }}>
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-2">
                        ← Back
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                            {getInitials(bidderProfile?.name)}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-sm">{bidderProfile?.name || `Bidder #${bidderId}`}</div>
                            <div className={`text-xs font-semibold ${connected ? 'text-green-500' : 'text-gray-400'}`}>
                                {connected ? '● Connected' : '○ Connecting...'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/video-call/${bidderId}`)}
                        className="flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-700 px-4 py-2 rounded-xl font-bold text-sm transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Video Call
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 bg-white rounded-2xl shadow-lg p-4 overflow-y-auto flex flex-col gap-3">
                    {messages.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <div className="text-5xl mb-4">💬</div>
                            <p className="font-medium">No messages yet. Say hello!</p>
                        </div>
                    )}
                    {messages.map((msg) => {
                        const isMine = String(msg.sender_id) === String(user?.id);
                        return (
                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                    isMine
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                }`}>
                                    <p>{msg.content}</p>
                                    <p className={`text-xs mt-1 ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="mt-4 flex gap-3">
                    <input
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                        placeholder="Type a message..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!connected || !input.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
