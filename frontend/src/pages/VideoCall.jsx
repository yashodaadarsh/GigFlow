import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const COMM_URL = 'http://localhost:5000';
const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function VideoCall() {
    const { bidderId: peerIdParam } = useParams(); // could be bidderId (if hirer) or hirerId (if bidder)
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

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
        fetch(`http://localhost:8081/api/auth/profile/${peerIdParam}`)
            .then(r => r.json())
            .then(setPeerProfile)
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
                socketRef.current?.emit('new-ice-candidate', {
                    target: peerIdParam,
                    candidate: event.candidate,
                });
            }
        };
        return pc;
    }, [peerIdParam]);

    const getLocalStream = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        return stream;
    };

    const connectSocket = useCallback(() => {
        const socket = io(COMM_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('register-user', user.id);
        });

        socket.on('video-offer', async ({ sdp, from }) => {
            // Receiving an offer: answer it
            const stream = localStreamRef.current || await getLocalStream();
            const pc = setupPeerConnection(stream);
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('video-answer', { target: peerIdParam, sdp: answer });
            setCallState('connected');
        });

        socket.on('video-answer', async ({ sdp }) => {
            await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(sdp));
        });

        socket.on('new-ice-candidate', async ({ candidate }) => {
            try {
                await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) { console.error(e); }
        });

        return socket;
    }, [user, peerIdParam, setupPeerConnection]);

    // On mount: check if there's a pending offer (callee joining after notification)
    useEffect(() => {
        if (!user) return;
        fetch(`${COMM_URL}/api/video/pending-offer/${user.id}`)
            .then(r => r.json())
            .then(async ({ offer }) => {
                if (offer) {
                    // There's a buffered offer — show "Answer Call" UI
                    pendingOfferRef.current = offer;
                    setCallState('ringing');
                }
            })
            .catch(console.error);
    }, [user]);

    const answerCall = async () => {
        setCallState('waiting');
        const stream = await getLocalStream();
        const socket = connectSocket();
        socketRef.current = socket;

        const offer = pendingOfferRef.current;
        await new Promise(resolve => socket.on('connect', resolve));

        const pc = setupPeerConnection(stream);
        await pc.setRemoteDescription(new RTCSessionDescription(offer.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('video-answer', { target: peerIdParam, sdp: answer });
        setCallState('connected');
    };

    const startCall = useCallback(async () => {
        setCallState('waiting');
        const stream = await getLocalStream();
        const socket = connectSocket();
        socketRef.current = socket;

        await new Promise(resolve => socket.on('connect', resolve));

        const pc = setupPeerConnection(stream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('video-offer', { target: peerIdParam, from: user.id, sdp: offer });
        setCallState('calling');
    }, [user, peerIdParam, connectSocket, setupPeerConnection]);

    const endCall = useCallback(() => {
        cleanup();
        setCallState('ended');
        setTimeout(() => navigate(-1), 1500);
    }, [cleanup, navigate]);

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
    }[callState];

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
            {/* Remote video */}
            <div className="w-full max-w-4xl relative rounded-3xl overflow-hidden bg-gray-900" style={{ aspectRatio: '16/9' }}>
                <video ref={remoteVideoRef} autoPlay playsInline className={`w-full h-full object-cover ${callState === 'connected' ? '' : 'hidden'}`} />

                {callState !== 'connected' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-extrabold">
                            {peerProfile?.name?.[0] ?? '?'}
                        </div>
                        <p className="text-lg font-bold">{peerProfile?.name || `User #${peerIdParam}`}</p>
                        <p className="text-gray-400 text-sm">{statusLabel}</p>

                        {/* ===== ANSWER button when there's an incoming call ===== */}
                        {callState === 'ringing' && (
                            <div className="flex gap-4 mt-2">
                                <button
                                    onClick={answerCall}
                                    className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-sm shadow-lg shadow-green-500/30 transition animate-pulse"
                                >
                                    📞 Answer
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition"
                                >
                                    📵 Decline
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Local PiP */}
                <video
                    ref={localVideoRef}
                    autoPlay playsInline muted
                    className="absolute bottom-4 right-4 w-32 rounded-xl border-2 border-white shadow-2xl object-cover bg-gray-800"
                    style={{ aspectRatio: '4/3' }}
                />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-6">
                <button onClick={() => navigate(-1)} className="px-5 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 font-bold text-sm">← Back</button>

                {callState === 'idle' && (
                    <button onClick={startCall} className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold shadow-lg text-sm">
                        📞 Start Call
                    </button>
                )}

                {(callState === 'calling' || callState === 'connected' || callState === 'waiting') && (
                    <>
                        <button onClick={toggleMic} className={`w-12 h-12 rounded-full text-lg ${micOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'}`}>
                            {micOn ? '🎙️' : '🔇'}
                        </button>
                        <button onClick={toggleCam} className={`w-12 h-12 rounded-full text-lg ${camOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'}`}>
                            {camOn ? '📹' : '🚫'}
                        </button>
                        <button onClick={endCall} className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm">
                            📵 End Call
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
