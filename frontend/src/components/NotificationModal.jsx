import { X, Bell, CheckCircle, Info, MessageSquare, Video, Terminal, Activity } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { markAllRead } from '../redux/slices/notifications.slice';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { list } = useSelector(state => state.notifications);
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    dispatch(markAllRead(user.id));
  };

  const handleNotificationClick = (n) => {
    onClose();
    const routes = {
      'CHAT': `/chat/${n.relatedId}`,
      'VIDEO_CALL': `/video-call/${n.relatedId}`,
      'HIRED': `/gig-pipeline/${n.relatedId}`,
      'STATUS_UPDATE': `/gig-pipeline/${n.relatedId}`
    };
    if (routes[n.type]) navigate(routes[n.type]);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'HIRED': return <CheckCircle size={14} className="text-[#10b981]" />;
      case 'CHAT': return <MessageSquare size={14} className="text-[#22d3ee]" />;
      case 'VIDEO_CALL': return <Video size={14} className="text-[#f59e0b]" />;
      default: return <Info size={14} className="text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="absolute top-16 right-0 w-80 sm:w-96 bg-[#111111] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 z-[100] overflow-hidden font-sans"
    >
      {/* Header Bar */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <h3 className="text-[10px] font-black text-white flex items-center gap-2 uppercase tracking-[0.3em]">
          <Activity size={14} className="text-[#10b981]" />
          Event_Logs
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* Notification Mesh Feed */}
      <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
        {list.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Terminal size={20} className="text-gray-700" />
            </div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">No_Events_In_Queue</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {list.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-5 hover:bg-white/[0.03] transition-all flex gap-4 cursor-pointer relative group ${!n.isRead ? 'bg-[#10b981]/5' : ''}`}
              >
                {!n.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981] shadow-[0_0_10px_#10b981]" />
                )}

                <div className="mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1">
                  <p className="text-[11px] font-bold text-gray-300 leading-relaxed mb-1 tracking-tight">
                    <span className="text-gray-600 mr-1 font-mono">{">"}</span>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">
                      {formatDistanceToNow(new Date(n.createdAt))} ago
                    </span>
                    <span className="text-[8px] font-black text-[#10b981]/40 uppercase tracking-tighter">
                      [ NODE_SYNC_OK ]
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Batch Actions */}
      {list.length > 0 && (
        <div className="p-4 border-t border-white/5 bg-white/[0.01]">
          <button
            onClick={handleMarkAllRead}
            className="w-full py-3 bg-transparent hover:bg-[#10b981] text-[#10b981] hover:text-[#0A0A0B] text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-[#10b981]/30 transition-all active:scale-95"
          >
            Clear_All_Events
          </button>
        </div>
      )}
    </motion.div>
  );
}