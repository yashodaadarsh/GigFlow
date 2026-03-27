import { X, Bell, CheckCircle, Info, MessageSquare, Video } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { markAllRead } from '../redux/slices/notifications.slice';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { list } = useSelector(state => state.notifications);
  const { user } = useSelector(state => state.auth);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    dispatch(markAllRead(user.id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'HIRED': return <CheckCircle size={18} className="text-green-500" />;
      case 'CHAT': return <MessageSquare size={18} className="text-blue-500" />;
      case 'VIDEO_CALL': return <Video size={18} className="text-pink-500" />;
      default: return <Info size={18} className="text-indigo-500" />;
    }
  };

  return (
    <div className="absolute top-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Bell size={18} className="text-indigo-600" />
          Notifications
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {list.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {list.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
              >
                <div className="mt-1">{getIcon(n.type)}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    {formatDistanceToNow(new Date(n.createdAt))} ago
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {list.length > 0 && (
        <div className="p-3 border-t border-gray-50 bg-gray-50/50">
          <button 
            onClick={handleMarkAllRead}
            className="w-full py-2 bg-white hover:bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl border border-indigo-100 transition-all active:scale-95"
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
