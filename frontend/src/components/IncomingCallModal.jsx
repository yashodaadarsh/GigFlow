import { Phone, PhoneOff, Video, Activity, ShieldAlert } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearIncomingCall } from '../redux/slices/notifications.slice';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

export default function IncomingCallModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { incomingCall } = useSelector(state => state.notifications);
  const { user } = useSelector(state => state.auth);

  if (!incomingCall || !user || String(incomingCall.callerId) === String(user.id)) return null;
  if (location.pathname.startsWith('/video-call')) return null;

  const handleAccept = () => {
    const roomId = incomingCall.roomId;
    dispatch(clearIncomingCall());
    navigate(`/video-call/${incomingCall.callerId}?room=${roomId}`);
  };

  const handleReject = () => {
    const socket = io(); // Ensure your socket URL is passed if not default
    socket.emit('video-decline', { target: incomingCall.callerId });
    setTimeout(() => socket.disconnect(), 1000);
    dispatch(clearIncomingCall());
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#0A0A0B]/90 backdrop-blur-md">
        {/* Radar Pulse Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 2, opacity: [0, 0.1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-96 h-96 rounded-full border border-[#10b981]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-[#111111] w-full max-w-sm rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative z-10"
        >
          {/* Top Status Strip */}
          <div className="bg-[#10b981]/10 px-6 py-2 border-b border-[#10b981]/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-[#10b981] animate-pulse" />
              <span className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em]">Priority_Interrupt</span>
            </div>
            <span className="text-[9px] font-mono text-gray-600 font-bold italic">RTC_SIG_01</span>
          </div>

          <div className="p-10 text-center">
            {/* Visual Identity Node */}
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 bg-[#0A0A0B] border-2 border-[#10b981]/30 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <Video size={36} className="text-[#10b981]" />
              </div>
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-2 -right-2 bg-[#10b981] p-1.5 rounded-lg shadow-lg"
              >
                <ShieldAlert size={14} className="text-[#0A0A0B]" />
              </motion.div>
            </div>

            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">Incoming_Link</h3>
            <p className="text-gray-500 font-bold text-[11px] uppercase tracking-widest">
              From_Node: <span className="text-gray-300">{incomingCall.callerName}</span>
            </p>

            <div className="flex gap-4 mt-10">
              {/* Decline Button */}
              <button
                onClick={handleReject}
                className="group flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-transparent border border-red-900/30 hover:bg-red-900/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
              >
                <PhoneOff size={20} className="group-hover:rotate-12 transition-transform" />
                Reject
              </button>

              {/* Accept Button */}
              <button
                onClick={handleAccept}
                className="group flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-[#10b981] hover:bg-white text-[#0A0A0B] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[#10b981]/20 active:scale-95"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Phone size={20} />
                </motion.div>
                Establish
              </button>
            </div>
          </div>

          {/* Bottom Data Line */}
          <div className="px-8 py-4 bg-white/5 border-t border-white/5 flex justify-center">
            <span className="text-[8px] font-mono text-gray-600 font-bold uppercase tracking-widest">
              Securing_Channel_via_WebRTC_DTLS...
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}