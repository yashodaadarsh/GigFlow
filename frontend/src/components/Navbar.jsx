import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { logout } from '../redux/slices/auth.slice';
import { LogOut, User, Menu, Bell, Search, Hexagon, Terminal, Activity } from 'lucide-react';
import NotificationModal from './NotificationModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { unreadCount } = useSelector(state => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const accentColor = user?.role === 'HIRER' ? 'var(--success)' : 'var(--accent-color)';

  return (
    <nav className="fixed top-0 w-full z-[100] px-6 py-6 pointer-events-none">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between glass px-8 py-4 rounded-[32px] pointer-events-auto shadow-2xl border-white/5">

        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-all duration-500" style={{ boxShadow: `0 0 20px hsla(${accentColor} / 0.1)` }}>
              <Hexagon size={22} className="text-white fill-white/10" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">
                GigFlow
              </span>
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-1 ml-0.5">V1.0_Mesh</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12">
          <Link to="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all flex items-center gap-2">
            <Terminal size={14} /> Platform
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-8 border-l border-white/10 pl-10">
              <Link to="/dashboard" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all flex items-center gap-2">
                <Activity size={14} /> Console
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="p-2 text-white/40 hover:text-white transition-all relative"
                >
                  <Bell size={20} />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-black"
                        style={{ backgroundColor: `hsl(${accentColor})`, boxShadow: `0 0 10px hsl(${accentColor})` }}
                      />
                    )}
                  </AnimatePresence>
                </button>
                <NotificationModal isOpen={showNotifs} onClose={() => setShowNotifs(false)} />
              </div>

              {/* User Identity */}
              <Link
                to={`/profile/${user?.id}`}
                className="flex items-center gap-3 px-4 py-2 rounded-xl border border-white/5 bg-white/[0.03] hover:border-white/20 transition-all group"
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `linear-gradient(135deg, hsl(${accentColor}), #fff)` }}>
                  <User size={14} className="text-black" />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                  {user?.name}
                </span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-6 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95 border border-white/10"
              >
                Terminate Session
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-8 border-l border-white/10 pl-10">
              <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">
                Log In
              </Link>
              <Link to="/signup" className="px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all shadow-2xl shadow-indigo-500/20">
                [ Sign Up ]
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-3 text-white/60 hover:text-white bg-white/5 rounded-xl border border-white/10 relative z-50">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-x-4 top-[90px] p-6 glass border border-white/10 rounded-2xl shadow-2xl z-40 bg-black/80 backdrop-blur-3xl"
          >
            <div className="flex flex-col gap-6 pointer-events-auto">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-white/60 hover:text-white transition-all flex items-center gap-3">
                <Terminal size={16} /> Platform
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-white/60 hover:text-white transition-all flex items-center gap-3">
                    <Activity size={16} /> Console
                  </Link>
                  <div className="h-px bg-white/10 my-2 w-full"></div>
                  <Link to={`/profile/${user?.id}`} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform" style={{ background: `linear-gradient(135deg, hsl(${accentColor}), #fff)` }}>
                      <User size={16} className="text-black" />
                    </div>
                    <span className="text-sm font-black text-white uppercase tracking-tighter">
                      {user?.name}
                    </span>
                  </Link>
                  <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="mt-4 px-6 py-3 w-full text-center text-white text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all border border-white/10">
                    Terminate Session
                  </button>
                </>
              ) : (
                <>
                  <div className="h-px bg-white/10 my-2 w-full"></div>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-white/60 hover:text-white transition-all">
                    Log In
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="mt-2 px-8 py-3 w-full text-center bg-indigo-600 text-white text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all shadow-2xl">
                    [ Sign Up ]
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </nav >
  );
}