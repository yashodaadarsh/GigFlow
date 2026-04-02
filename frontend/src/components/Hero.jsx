import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative pt-32 md:pt-44 pb-20 md:pb-32 px-6 overflow-hidden bg-[#0A0A0B]">
            {/* Dynamic Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#10b981]/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#06b6d4]/5 blur-[100px] rounded-full" />

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 mb-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981]">
                            Mini-Freelance Marketplace Platform
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.85]">
                        POST. BID. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] via-[#22d3ee] to-[#3b82f6]">
                            HIRE INSTANTLY.
                        </span>
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-12 leading-relaxed font-medium">
                        The ultimate mini-marketplace for high-intent collaboration. Experience
                        <span className="text-white"> Atomic Hiring Logic</span>—where clients assign gigs and bidders secure work through a seamless ecosystem.
                    </p>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 items-center sm:items-start">
                        <button className="w-full sm:w-auto px-10 py-5 bg-black border-2 border-[#10b981]/40 text-[#10b981] font-black rounded-sm hover:bg-[#10b981] hover:text-black transition-all shadow-[0_0_30px_rgba(16,185,129,0.15)] uppercase tracking-widest text-sm">
                            [ Post a Gig ]
                        </button>
                        <button className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-sm hover:text-[#22d3ee] transition-colors group">
                            Explore Gigs <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform text-[#10b981]" />
                        </button>
                    </div>
                </motion.div>

                {/* Floating Code Mockup */}
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative lg:block hidden"
                >
                    <div className="absolute inset-0 bg-[#10b981]/20 blur-[60px] rounded-full" />
                    <div className="relative bg-[#0F0F10] border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-white/10" />
                                <div className="w-3 h-3 rounded-full bg-white/10" />
                            </div>
                            <span className="text-[10px] font-mono text-[#10b981] font-bold">SOCKET_ACTIVE</span>
                        </div>
                        <div className="font-mono text-sm space-y-4">
                            <TypeAnimation
                                sequence={[
                                    '> Broadcast: New Gig "React Dashboard"\n> Incoming Bid: $1,200\n> Analyzing Proposal Signal...\n> Signal Strength: 98%',
                                    1500,
                                    '> Client clicked [HIRE]\n> Atomic Transaction Initialized...\n> Competing bids auto-rejected.\n> Status: GIG_ASSIGNED',
                                    3000
                                ]}
                                repeat={Infinity}
                                style={{ whiteSpace: 'pre-line', display: 'block', color: '#94a3b8' }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}