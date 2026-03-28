import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <span className="bg-blue-600 text-white rounded-md p-1 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </span>
              GigFlow
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              The premium freelance marketplace designed for high-performance collaboration, AI-driven networking, and fast payouts.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 tracking-wide uppercase text-xs">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/explore" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Explore Gigs</Link></li>
              <li><Link to="/how-it-works" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">How it Works</Link></li>
              <li><Link to="/pricing" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 tracking-wide uppercase text-xs">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} GigFlow Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
             <span>🚀 Built with React & Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
