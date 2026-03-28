import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  PlusCircle, 
  Briefcase, 
  CheckCircle, 
  Search, 
  LayoutDashboard,
  Clock,
  Zap,
  Activity,
  History
} from 'lucide-react';

export default function Sidebar({ role }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const hirerLinks = [
    { name: 'System Profile', path: '/dashboard/profile', icon: <User size={18} /> },
    { name: 'Deploy New Gig', path: '/dashboard/post-gig', icon: <PlusCircle size={18} /> },
    { name: 'Active Mesh', path: '/dashboard/my-gigs', icon: <Activity size={18} /> },
    { name: 'Event History', path: '/dashboard/completed', icon: <History size={18} /> },
  ];

  const bidderLinks = [
    { name: 'My Profile', path: '/dashboard/profile', icon: <User size={18} /> },
    { name: 'Discover Gigs', path: '/dashboard/find-gigs', icon: <Search size={18} /> },
    { name: 'My Bids', path: '/dashboard/my-bids', icon: <Clock size={18} /> },
  ];

  const links = role === 'HIRER' ? hirerLinks : bidderLinks;
  const accentColor = role === 'HIRER' ? 'var(--success)' : 'var(--accent-color)';

  return (
    <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 h-full sticky top-0 hidden md:flex flex-col overflow-y-auto">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-black" style={{ backgroundColor: `hsl(${accentColor})` }}>
            {role?.[0] || 'G'}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">
            {role === 'HIRER' ? 'Hirer_Console' : 'Bidder_Console'}
          </span>
        </div>

        <nav className="space-y-2">
          {links.map((link) => {
            const isActive = currentPath.includes(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
                style={isActive ? { borderLeft: `3px solid hsl(${accentColor})` } : {}}
              >
                <span className={isActive ? 'text-white' : 'text-inherit opacity-70'}>{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8">
        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={12} className="text-white/40" />
            <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Node_Status</span>
          </div>
          <div className="text-[10px] font-mono whitespace-nowrap" style={{ color: `hsl(${accentColor})` }}>
            {role}_ONLINE_V1.0
          </div>
        </div>
      </div>
    </aside>
  );
}
