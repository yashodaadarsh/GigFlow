// components/Features.jsx
import { motion } from 'framer-motion';
import { Zap, Code, Shield } from 'lucide-react';

const features = [
    {
        title: "AI-Powered Matching",
        desc: "Our engine analyzes your GitHub and portfolio to find the perfect stack-match.",
        icon: <Zap className="text-brand" />,
        size: "md:col-span-2"
    },
    {
        title: "Secure Escrow",
        desc: "Payments locked in smart contracts.",
        icon: <Shield className="text-green-400" />,
        size: "md:col-span-1"
    },
    {
        title: "Developer First",
        desc: "Native integration with VS Code, Slack, and Linear.",
        icon: <Code className="text-blue-400" />,
        size: "md:col-span-3"
    }
];

export default function Features() {
    return (
        <section className="py-24 px-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">At a fraction of the effort</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((f, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className={`${f.size} bg-[#161618] border border-white/5 p-8 rounded-3xl hover:border-brand/30 transition-colors`}
                    >
                        <div className="mb-4">{f.icon}</div>
                        <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                        <p className="text-gray-400">{f.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}