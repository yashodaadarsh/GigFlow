import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { logout } from '../redux/slices/auth.slice';
import { LogOut, User, Menu, Bell, Search } from 'lucide-react';
import NotificationModal from './NotificationModal';

export default function Navbar() {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { unreadCount } = useSelector(state => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-lg p-1.5 shadow-md shadow-blue-500/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </span>
              GigFlow
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Dashboard</Link>
                <div className="flex items-center gap-4 ml-4 border-l pl-4 border-gray-300">
                  {/* Notification Bell */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifs(!showNotifs)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    <NotificationModal isOpen={showNotifs} onClose={() => setShowNotifs(false)} />
                  </div>

                  <Link to={`/profile/${user?.id}`} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 transition-all">
                    <User size={18} className="text-blue-600" />
                    <span>{user?.name}</span>
                  </Link>

                  <button onClick={handleLogout} className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-gray-200">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-semibold px-3 py-2">Log In</Link>
                <Link to="/signup" className="bg-blue-600 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/30 transition-all hover:-translate-y-0.5">Sign Up</Link>
              </div>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
