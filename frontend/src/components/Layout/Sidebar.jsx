import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  PlusCircle, 
  Briefcase, 
  CheckCircle, 
  Search, 
  LayoutDashboard,
  Clock
} from 'lucide-react';

export default function Sidebar({ role }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const hirerLinks = [
    { name: 'Profile', path: '/dashboard/profile', icon: <User size={20} /> },
    { name: 'Post a Gig', path: '/dashboard/post-gig', icon: <PlusCircle size={20} /> },
    { name: 'My Gigs', path: '/dashboard/my-gigs', icon: <Briefcase size={20} /> },
    { name: 'Completed', path: '/dashboard/completed', icon: <CheckCircle size={20} /> },
  ];

  const bidderLinks = [
    { name: 'Profile', path: '/dashboard/profile', icon: <User size={20} /> },
    { name: 'Find Gigs', path: '/dashboard/find-gigs', icon: <Search size={20} /> },
    { name: 'My Bids', path: '/dashboard/my-bids', icon: <Clock size={20} /> },
  ];

  const links = role === 'HIRER' ? hirerLinks : bidderLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100-4rem)] sticky top-16 hidden md:block overflow-y-auto">
      <div className="p-6">
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                currentPath === link.path
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
