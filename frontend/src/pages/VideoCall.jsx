import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { ChevronLeft, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from 'lucide-react';
import api from '../api/api';

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function VideoCall() {
    const { bidderId: peerIdParam } = useParams(); // could be bidderId (if hirer) or hirerId (if bidder)
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isCallee = !!queryParams.get('room');

    const [callState, setCallState] = useState('idle');   // idle | waiting | ringing | connected | ended
    const [peerProfile, setPeerProfile] = useState(null);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const socketRef = useRef(null);
    const pendingOfferRef = useRef(null);

    // Fetch peer info
    useEffect(() => {
        api.get(`/auth/profile/${peerIdParam}`)
            .then(res => setPeerProfile(res.data))
            .catch(console.error);
    }, [peerIdParam]);

    const cleanup = useCallback(() => {
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        peerConnectionRef.current?.close();
        socketRef.current?.disconnect();
        peerConnectionRef.current = null;
        localStreamRef.current = null;
    }, []);

    useEffect(() => () => cleanup(), [cleanup]);

    const setupPeerConnection = useCallback((stream) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        stream?.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                setCallState('connected');
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('[VideoCall] Sending ICE candidate to:', peerIdParam);
                socketRef.current?.emit('new-ice-candidate', {
                    target: peerIdParam,
                    candidate: event.candidate,
                });
            }
        };
        return pc;
    }, [peerIdParam]);

    const getLocalStream = async () => {
        const constraints = [
            { video: true, audio: true },
            { video: false, audio: true },
            { video: false, audio: false }
        ];

        for (const constraint of constraints) {
            try {
                if (!constraint.video && !constraint.audio) break;
                console.log(`[VideoCall] Requesting media:`, constraint);
                const stream = await navigator.mediaDevices.getUserMedia(constraint);
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                if (!constraint.video) setCamOn(false);
                return stream;
            } catch (err) {
                console.warn(`[VideoCall] Failed to get ${constraint.video ? 'video' : 'audio'}:`, err.message);
            }
        }

        console.warn('[VideoCall] Proceeding without local media.');
        return new MediaStream(); // Return empty stream to avoid crashes
    };

    const iceCandidateQueue = useRef([]);

    const connectSocket = useCallback(() => {
        console.log('[VideoCall] Connecting socket...');
        const socket = io({ 
            transports: ['websocket'],
            upgrade: false 
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[VideoCall] Socket connected:', socket.id);
            socket.emit('register-user', user.id);
        });

        socket.on('video-offer', async ({ sdp, from }) => {
            console.log('[VideoCall] Received offer via socket from:', from);
            if (peerConnectionRef.current) {
                console.log('[VideoCall] Peer connection already exists, ignoring duplicate offer');
                return;
            }
            const stream = localStreamRef.current || await getLocalStream();
            const pc = setupPeerConnection(stream);
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('video-answer', { target: peerIdParam, sdp: answer });
            setCallState('connected');
            
            // Process queued candidates
            while (iceCandidateQueue.current.length > 0) {
                const candidate = iceCandidateQueue.current.shift();
                await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
            }
        });

        socket.on('video-answer', async ({ sdp }) => {
            console.log('[VideoCall] Received answer');
            const pc = peerConnectionRef.current;
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                // Process queued candidates
                while (iceCandidateQueue.current.length > 0) {
                    const candidate = iceCandidateQueue.current.shift();
                    await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
                }
            }
        });

        socket.on('video-decline', () => {
            console.log('[VideoCall] Call declined');
            cleanup();
            setCallState('declined');
            setTimeout(() => navigate(-1), 2000);
        });

        socket.on('video-hangup', () => {
            console.log('[VideoCall] Call hung up');
            cleanup();
            setCallState('ended');
            setTimeout(() => navigate(-1), 2000);
        });

        socket.on('new-ice-candidate', async ({ candidate }) => {
            console.log('[VideoCall] New ice candidate');
            const pc = peerConnectionRef.current;
            if (pc && pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
            } else {
                iceCandidateQueue.current.push(candidate);
            }
        });

        return socket;
    }, [user, peerIdParam, setupPeerConnection, cleanup, navigate]);

    const answerCall = async () => {
        try {
            setCallState('waiting');
            const stream = await getLocalStream();
            const socket = connectSocket();
            socketRef.current = socket;

            // Wait for socket to connect and register
            if (!socket.connected) {
                await new Promise(resolve => socket.on('connect', resolve));
            }

            const offer = pendingOfferRef.current;
            if (!offer) {
                console.warn('[VideoCall] No pending offer to answer');
                setCallState('idle');
                return;
            }

            if (peerConnectionRef.current) {
                console.log('[VideoCall] Peer connection already setup (likely via socket offer), skipping manual answer');
                setCallState('connected');
                return;
            }

            const pc = setupPeerConnection(stream);
            await pc.setRemoteDescription(new RTCSessionDescription(offer.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('video-answer', { target: peerIdParam, sdp: answer });
            setCallState('connected');
        } catch (err) {
            console.error('Failed to answer call:', err);
            setCallState('idle');
        }
    };

    const startCall = useCallback(async () => {
        try {
            setCallState('waiting');
            const stream = await getLocalStream();
            const socket = connectSocket();
            socketRef.current = socket;

            // Wait for socket to connect and register
            if (!socket.connected) {
                await new Promise(resolve => socket.on('connect', resolve));
                // Wait a bit for register-user to be processed by server
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const pc = setupPeerConnection(stream);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('video-offer', { target: peerIdParam, from: user.id, sdp: offer });
            setCallState('calling');
        } catch (err) {
            console.error('Failed to start call:', err);
        }
    }, [user, peerIdParam, connectSocket, setupPeerConnection]);

    const callInitiatedRef = useRef(false);

    // On mount: check if there's a pending offer (callee joining after notification)
    useEffect(() => {
        if (!user || callInitiatedRef.current) return;
        
        // Auto-start or Auto-answer
        if (callState === 'idle') {
            callInitiatedRef.current = true;
            
            if (isCallee) {
                console.log('[VideoCall] Joining as callee, fetching pending offer...');
                api.get(`/video/pending-offer/${user.id}`)
                    .then(res => {
                        const { offer } = res.data;
                        if (offer) {
                            console.log('[VideoCall] Found pending offer, answering...');
                            pendingOfferRef.current = offer;
                            answerCall();
                        } else {
                            console.log('[VideoCall] No pending offer found via API, waiting for socket offer...');
                            // We stay in waiting/idle, connectSocket will handle incoming offer
                            connectSocket();
                        }
                    })
                    .catch(err => {
                        console.error('[VideoCall] API error fetching offer:', err);
                        connectSocket();
                    });
            } else {
                console.log('[VideoCall] Auto-starting call as caller...');
                startCall();
            }
        }
    }, [user, callState, startCall, isCallee, connectSocket, answerCall]); 

    const endCall = useCallback(() => {
        socketRef.current?.emit('video-hangup', { target: peerIdParam });
        cleanup();
        setCallState('ended');
        setTimeout(() => navigate(-1), 3000);
    }, [cleanup, navigate, peerIdParam]);

    const toggleMic = () => {
        const t = localStreamRef.current?.getAudioTracks()[0];
        if (t) { t.enabled = !t.enabled; setMicOn(p => !p); }
    };

    const toggleCam = () => {
        const t = localStreamRef.current?.getVideoTracks()[0];
        if (t) { t.enabled = !t.enabled; setCamOn(p => !p); }
    };

    const statusLabel = {
        idle: 'Ready',
        ringing: '📞 Incoming call...',
        waiting: '⌛ Connecting...',
        calling: '📞 Calling...',
        connected: '🟢 Connected',
        ended: '✓ Call Ended',
        declined: '📵 Call Declined',
    }[callState];

    if (callState === 'ended' || callState === 'declined') {
        return (
            <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6 font-['Inter']">
                <div className="text-center">
                    <div className="w-24 h-24 bg-red-600/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-pulse text-red-500">
                        <PhoneOff size={48} />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
                        {callState === 'declined' ? 'Call Declined' : 'Call Ended'}
                    </h1>
                    <p className="text-gray-400 font-medium text-lg">Redirecting you back shortly...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0c] relative overflow-hidden font-['Inter']">
            {/* Remote video */}
            <div className="w-full max-w-4xl relative rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl" style={{ aspectRatio: '16/9' }}>
                <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className={`w-full h-full object-cover transition-opacity duration-1000 ${callState === 'connected' ? 'opacity-100' : 'opacity-0 hidden'}`} 
                />

                {callState !== 'connected' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4 bg-gray-900/50 backdrop-blur-md">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-extrabold shadow-2xl animate-pulse">
                            {peerProfile?.name?.[0] ?? '?'}
                        </div>
                        <p className="text-2xl font-black">{peerProfile?.name || `User #${peerIdParam}`}</p>
                        <p className="text-indigo-400 font-bold tracking-widest uppercase text-xs">{statusLabel}</p>

                        {/* ===== ANSWER button when there's an incoming call ===== */}
                        {callState === 'ringing' && (
                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={answerCall}
                                    className="px-10 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all active:scale-95 animate-bounce"
                                >
                                    Answer
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="px-10 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95"
                                >
                                    Decline
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Local PiP */}
                <div className="absolute bottom-6 right-6 w-32 md:w-48 group">
                    <video
                        ref={localVideoRef}
                        autoPlay playsInline muted
                        className="w-full rounded-2xl border-2 border-white/20 shadow-2xl object-cover bg-gray-800 transition-all group-hover:scale-105"
                        style={{ aspectRatio: '4/3' }}
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-md text-[8px] font-black text-white uppercase tracking-widest">You</div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mt-8 px-8 py-4 bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl">
                <button 
                  onClick={() => navigate(-1)} 
                  className="p-3 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
                  title="Back"
                >
                  <ChevronLeft size={24} />
                </button>

                {callState === 'idle' && (
                    <button 
                        onClick={startCall} 
                        className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        Start Video Call
                    </button>
                )}

                {(callState === 'calling' || callState === 'connected' || callState === 'waiting') && (
                    <>
                        <button 
                            onClick={toggleMic} 
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${micOn ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-red-600 text-white animate-pulse'}`}
                        >
                            {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                        </button>
                        <button 
                            onClick={toggleCam} 
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${camOn ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-red-600 text-white animate-pulse'}`}
                        >
                            {camOn ? <VideoIcon size={24} /> : <VideoOff size={24} />}
                        </button>
                        <button 
                            onClick={endCall} 
                            className="px-10 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-red-500/20 flex items-center gap-2"
                        >
                            <PhoneOff size={20} />
                            End Call
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
