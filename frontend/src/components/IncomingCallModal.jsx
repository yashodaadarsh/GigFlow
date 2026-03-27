import { Phone, PhoneOff, Video } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearIncomingCall } from '../redux/slices/notifications.slice';
import { useNavigate } from 'react-router-dom';

export default function IncomingCallModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { incomingCall } = useSelector(state => state.notifications);

  if (!incomingCall) return null;

  const handleAccept = () => {
    const roomId = incomingCall.roomId;
    dispatch(clearIncomingCall());
    navigate(`/video-call/${incomingCall.callerId}?room=${roomId}`);
  };

  const handleReject = () => {
    dispatch(clearIncomingCall());
    // Optionally notify the caller
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 animate-bounce">
            <Video size={36} className="text-white" />
          </div>
          
          <h3 className="text-xl font-black text-gray-900 mb-2">Incoming Video Call</h3>
          <p className="text-gray-500 font-medium">{incomingCall.callerName} is calling you...</p>
          
          <div className="flex gap-4 mt-8">
            <button 
              onClick={handleReject}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold transition-all active:scale-95"
            >
              <PhoneOff size={20} />
              Decline
            </button>
            <button 
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 active:scale-95 animate-pulse"
            >
              <Phone size={20} />
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
