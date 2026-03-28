import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Workflow from '../components/Workflow';
import SystemMap from '../components/SystemMap'; // Updated Component
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="bg-[#0A0A0B] min-h-screen text-white">
      <main>
        <Hero />

        {/* Visual Continuity Line */}
        <div className="flex justify-center h-24">
          <div className="w-px h-full bg-gradient-to-b from-[#10b981] to-transparent" />
        </div>

        <Workflow />

        {/* The New Interactive Architecture */}
        <SystemMap />

        {/* Closing Logo Ticker */}
        <section className="py-32 border-t border-white/5 opacity-20 hover:opacity-100 transition-opacity duration-1000">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-12 grayscale items-center px-6">
            {['KAFKA', 'SPRING BOOT', 'WEBRTC', 'REDIS', 'MONGODB'].map(tech => (
              <span key={tech} className="text-2xl font-black italic tracking-tighter">{tech}</span>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}