import { motion } from 'framer-motion';

export default function Comparison() {
    return (
        <section className="py-24 px-6 max-w-7xl mx-auto" id="trust">
            <div className="bg-[#161618] rounded-[3.5rem] border border-white/5 p-8 md:p-20 flex flex-col lg:flex-row gap-20 items-center">
                <div className="flex-1">
                    <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Built for speed, <br /> not for noise.</h2>
                    <p className="text-gray-400 text-lg mb-10 font-medium">Traditional platforms focus on bidding wars. GigFlow focuses on matching vectors. Join the elite top 1% instantly.</p>
                    <div className="space-y-4">
                        {["No manual filtering", "Automated Escrow release", "Direct-to-Dev communication"].map((t, i) => (
                            <div key={i} className="flex items-center gap-3 font-bold text-gray-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#6D72EB]" /> {t}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 w-full bg-[#0A0A0B] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-black text-gray-600 uppercase tracking-widest">
                                <span>Old-school Hiring</span>
                                <span>14 Days Avg</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} transition={{ duration: 1.5 }} className="h-full bg-gray-800" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-black text-[#6D72EB] uppercase tracking-widest">
                                <span>GigFlow Vector Match</span>
                                <span>2 Hours Avg</span>
                            </div>
                            <div className="h-3 bg-[#6D72EB]/10 rounded-full overflow-hidden border border-[#6D72EB]/20">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '15%' }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-[#6D72EB] shadow-[0_0_20px_#6D72EB]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}