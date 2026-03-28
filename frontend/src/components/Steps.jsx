import { motion } from 'framer-motion';

const steps = [
    {
        label: "01",
        title: "Post your Gig",
        desc: "Define your requirements and budget. Our AI extracts skill vectors instantly.",
        cost: "Traditional: $2k/fee",
        saving: "GigFlow: $0 upfront"
    },
    {
        label: "02",
        title: "AI Analysis",
        desc: "The engine scans 10k+ verified profiles to find the perfect technical match.",
        cost: "Agency: 2 Weeks",
        saving: "GigFlow: 4 Hours"
    },
    {
        label: "03",
        title: "Secure Payout",
        desc: "Funds are held in escrow and released only when milestones are approved.",
        cost: "Risk: High",
        saving: "GigFlow: 100% Secure"
    }
];

export default function Steps() {
    return (
        <section className="py-32 px-6 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">

                {/* Left Side: Floating Cards */}
                <div className="space-y-6">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="bg-[#161618] border border-white/5 p-8 rounded-2xl flex items-start gap-6 hover:border-[#6D72EB]/30 transition-all group"
                        >
                            <span className="text-[#6D72EB] font-black text-xl font-mono">{step.label}</span>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-gray-400 font-medium mb-4">{step.desc}</p>
                                <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
                                    <span className="text-gray-600 line-through">{step.cost}</span>
                                    <span className="text-emerald-400">{step.saving}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Right Side: Comparison Box (Image 2 style) */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="bg-[#161618] rounded-[2.5rem] border border-white/5 p-12 relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold mb-6 text-white leading-tight">
                            At a fraction of <br /> your current effort
                        </h2>
                        <p className="text-gray-400 mb-10 text-lg">
                            Get an unrivaled matching ratio. Forget hunting and ingest verified talent directly into your workflow.
                        </p>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Traditional Agency</span>
                                    <span>$5,000 / month</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} className="h-full bg-gray-700" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold text-[#6D72EB] uppercase tracking-widest">
                                    <span>GigFlow Pro</span>
                                    <span>$199 / month</span>
                                </div>
                                <div className="h-2 bg-[#6D72EB]/20 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '15%' }}
                                        className="h-full bg-[#6D72EB] shadow-[0_0_15px_#6D72EB]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}