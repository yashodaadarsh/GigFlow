import { motion } from 'framer-motion';

const steps = [
    {
        num: "01",
        label: "CRUD / POST",
        title: "Gig Initiation",
        desc: "Define your gig parameters—Title, Description, and Budget—to deploy a live Gig to the global feed.",
        footer: "Supports Fluid Roles: Clients can pivot to bidders instantly."
    },
    {
        num: "02",
        label: "BIDS",
        title: "Bid Aggregation",
        desc: "Bidders submit high-signal proposals. Our engine tracks price points and messages in a centralized bid repository.",
        footer: "Powered by a secure API architecture for high-intent bidding."
    },
    {
        num: "03",
        label: "ACID / SOCKET",
        title: "Atomic Selection",
        desc: "One-click 'Hire' logic triggers an atomic update: the Gig is assigned, the bidder is hired, and competing bids are auto-rejected.",
        footer: "Socket.io notifications for hired talent."
    }
];

export default function Workflow() {
    return (
        <section className="py-32 px-6 bg-[#0A0A0B]">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20">
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-tight mb-4">
                        THE WORKFLOW <br />
                        <span className="text-[#10b981]">SIMPLIFIED.</span>
                    </h2>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[11px]">A system designed for secure job posting and hiring.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-0 border border-white/10 rounded-3xl overflow-hidden bg-[#0F0F10]">
                    {steps.map((s, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.02)" }}
                            className="p-12 border-r border-white/10 last:border-r-0 relative group flex flex-col justify-between min-h-[450px]"
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-16">
                                    <span className="text-[#10b981] font-black text-xs font-mono tracking-widest uppercase">Step {s.num}</span>
                                    <span className="text-[10px] text-gray-700 font-black uppercase tracking-widest">{s.label}</span>
                                </div>

                                <h3 className="text-3xl font-black text-white mb-6 tracking-tight">{s.title}</h3>
                                <p className="text-gray-400 font-medium leading-relaxed mb-10 text-sm md:text-base">{s.desc}</p>
                            </div>

                            <div className="border-t border-white/5 pt-8 relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-tighter text-[#10b981] flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full shadow-[0_0_8px_#10b981]" />
                                    {s.footer}
                                </p>
                            </div>

                            {/* Huge Background Number */}
                            <span className="absolute bottom-4 right-8 text-[140px] font-black text-white/[0.02] pointer-events-none group-hover:text-[#10b981]/5 transition-colors duration-500">
                                {s.num}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}