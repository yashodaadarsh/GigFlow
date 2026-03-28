import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
    Server, Shield, Box, MessageSquare,
    CreditCard, Bell, Cpu, Share2, Database
} from 'lucide-react';

const services = [
    { id: 'auth', name: 'Auth Service', icon: <Shield />, type: 'PRODUCER', details: 'Handles App Requests and User Details. Produces Bidder details to Kafka.', color: '#10b981' },
    { id: 'gig', name: 'Gig Service', icon: <Box />, type: 'PRODUCER', details: 'Manages the Gig lifecycle. Produces gigdetails for recommendation and search.', color: '#22d3ee' },
    { id: 'bid', name: 'Bid Service', icon: <Share2 />, type: 'HYBRID', details: 'Produces biddetails and consumes gigdetails for context validation.', color: '#3b82f6' },
    { id: 'recommend', name: 'AI Recommendation', icon: <Cpu />, type: 'CONSUMER', details: 'Consumes gig/bid/bidder details to calculate matching vectors.', color: '#10b981' },
    { id: 'payment', name: 'Payment Service', icon: <CreditCard />, type: 'CONSUMER', details: 'Triggered automatically when gig status transitions to HIRED.', color: '#f59e0b' },
];

export default function SystemMap() {
    const [selected, setSelected] = useState(services[0]);

    return (
        <section className="py-32 px-6 bg-[#0A0A0B] overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16">
                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                        Atomic <br />
                        <span className="text-[#10b981] not-italic">Event Mesh.</span>
                    </h2>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[11px] mt-4">
                        Interactive System Architecture & Workflow.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-center">

                    {/* Left: Interactive Node Map */}
                    <div className="lg:col-span-8 relative">
                        {/* The Kafka Central Spine */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-full bg-gradient-to-b from-transparent via-[#10b981]/20 to-transparent lg:block hidden" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            {services.map((s, i) => (
                                <motion.div
                                    key={s.id}
                                    onClick={() => setSelected(s)}
                                    whileHover={{ scale: 1.02 }}
                                    className={`cursor-pointer p-8 rounded-2xl border transition-all duration-500 ${selected.id === s.id
                                            ? 'bg-[#111111] border-[#10b981] shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                                            : 'bg-[#0F0F10] border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-xl text-black`} style={{ backgroundColor: s.color }}>
                                            {s.icon}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{s.type}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-2">{s.name}</h3>
                                    <div className="h-1 w-12 rounded-full" style={{ backgroundColor: s.color }} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Simulated Data Packets (Animations) */}
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 pointer-events-none lg:block hidden"
                            >
                                <motion.div
                                    animate={{
                                        y: [0, 400],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                    className="absolute left-1/2 top-0 w-2 h-2 bg-[#10b981] rounded-full blur-[2px]"
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right: Service Detail & Stage Workflow */}
                    <div className="lg:col-span-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selected.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-[#111111] border border-white/10 rounded-3xl p-10 h-full"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <Database className="text-[#10b981]" size={20} />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                                        Persistence: {selected.id}servicedb
                                    </span>
                                </div>

                                <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">
                                    {selected.name}
                                </h3>

                                <p className="text-gray-400 font-medium leading-relaxed mb-10 text-sm">
                                    {selected.details}
                                </p>

                                <div className="space-y-6">
                                    <div className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em] mb-4">Core Workflow Stage</div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-6 h-6 rounded-full border border-[#10b981] flex items-center justify-center text-[10px] text-[#10b981]">1</div>
                                        <p className="text-xs text-white font-bold leading-tight uppercase tracking-tighter">
                                            Request validated via API Gateway
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-6 h-6 rounded-full border border-gray-800 flex items-center justify-center text-[10px] text-gray-600">2</div>
                                        <p className="text-xs text-gray-500 font-bold leading-tight uppercase tracking-tighter">
                                            Event broadcasted to Kafka Cluster
                                        </p>
                                    </div>
                                </div>

                                <button className="mt-12 w-full py-4 bg-transparent border border-white/10 text-white font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-black transition-all">
                                    View API Specs
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
}