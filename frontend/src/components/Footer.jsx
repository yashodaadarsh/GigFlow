import { Link } from 'react-router-dom';
import { Hexagon, Terminal, Activity, Cpu } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0B] border-t border-white/5 pt-24 pb-12 mt-auto overflow-hidden relative font-sans">
      {/* Background Engineering Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
      />

      {/* Deep Emerald Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#10b981]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">

          {/* Brand & Mesh Descriptor */}
          <div className="col-span-1 md:col-span-5">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-9 h-9 bg-[#10b981] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-transform duration-500 group-hover:rotate-90">
                <Hexagon size={20} className="text-[#0A0A0B] fill-[#0A0A0B]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">
                  GigFlow
                </span>
                <span className="text-[8px] font-bold text-[#10b981] tracking-[0.3em] uppercase mt-1">
                  Event-Driven Engine
                </span>
              </div>
            </Link>

            <p className="text-gray-500 text-sm leading-relaxed max-w-sm font-medium">
              Distributed freelance ecosystem utilizing an
              <span className="text-white"> Asynchronous Microservices Mesh</span>.
              Designed for high-signal technical collaboration and atomic hiring logic.
            </p>

            <div className="flex gap-6 mt-10">
              <FaGithub size={18} className="text-gray-600 hover:text-[#10b981] cursor-pointer transition-all hover:-translate-y-1" />
              <FaTwitter size={18} className="text-gray-600 hover:text-[#10b981] cursor-pointer transition-all hover:-translate-y-1" />
              <FaLinkedin size={18} className="text-gray-600 hover:text-[#10b981] cursor-pointer transition-all hover:-translate-y-1" />
            </div>
          </div>

          {/* Service Map Navigation */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-black text-white mb-8 tracking-[0.2em] uppercase text-[10px] flex items-center gap-2">
              <div className="w-1 h-1 bg-[#10b981] rounded-full" /> Console
            </h3>
            <ul className="space-y-4">
              <li><Link to="/explore" className="text-gray-500 hover:text-[#10b981] text-[11px] font-black uppercase tracking-widest transition-colors block">Browse_Gigs</Link></li>
              <li><Link to="/how-it-works" className="text-gray-500 hover:text-[#10b981] text-[11px] font-black uppercase tracking-widest transition-colors block">System_Logic</Link></li>
              <li><Link to="/pricing" className="text-gray-500 hover:text-[#10b981] text-[11px] font-black uppercase tracking-widest transition-colors block">Node_Credits</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h3 className="font-black text-white mb-8 tracking-[0.2em] uppercase text-[10px] flex items-center gap-2">
              <div className="w-1 h-1 bg-[#10b981] rounded-full" /> Protocol
            </h3>
            <ul className="space-y-4">
              <li><Link to="#" className="text-gray-500 hover:text-[#10b981] text-[11px] font-black uppercase tracking-widest transition-colors block">Privacy_Auth</Link></li>
              <li><Link to="#" className="text-gray-500 hover:text-[#10b981] text-[11px] font-black uppercase tracking-widest transition-colors block">Service_Terms</Link></li>
              <li><Link to="#" className="text-gray-500 hover:text-[#10b981] text-[11px] font-black uppercase tracking-widest transition-colors block">API_Endpoint</Link></li>
            </ul>
          </div>

          {/* Operational Status Card */}
          <div className="col-span-1 md:col-span-3">
            <div className="p-6 bg-[#111111] border border-white/10 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-20 transition-opacity">
                <Cpu size={40} className="text-[#10b981]" />
              </div>

              <div className="flex items-center gap-2 mb-6">
                <Terminal size={14} className="text-[#10b981]" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Mesh Monitor</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Kafka Clusters</span>
                  <span className="text-[10px] font-bold text-[#10b981]">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Services Sync</span>
                  <span className="text-[10px] font-bold text-[#10b981]">99.98%</span>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                  <Activity size={12} className="text-[#10b981] animate-pulse" />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                    All Nodes Operational
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specification Bar */}
        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
          <div className="flex items-center gap-4">
            <p>© {new Date().getFullYear()} GIGFLOW ENGINE</p>
            <span className="hidden md:block text-white/10">|</span>
            <p className="hidden md:block">LOC: 127.0.0.1:8080</p>
          </div>

          <div className="flex items-center gap-8 mt-6 md:mt-0">
            <span className="flex items-center gap-2 text-[#10b981]">
              <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full shadow-[0_0_8px_#10b981]" />
              RUNTIME: VITE_REACT_PROD
            </span>
            <span className="hover:text-white cursor-pointer transition-colors flex items-center gap-1">
              <Terminal size={12} /> DEPLOY_LOGS
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}