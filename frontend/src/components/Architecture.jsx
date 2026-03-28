import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Server, Database, Activity, Shield,
    Cpu, MessageSquare, Share2, Layers,
    Zap, Box, Hexagon, Code2
} from 'lucide-react';

const architectureData = {
    services: [
        { id: 'gateway', title: 'API Gateway', tech: 'Spring Cloud', icon: <Share2 />, desc: 'Rate limiting, Auth validation, and Request routing.' },
        { id: 'auth', title: 'Auth Service', tech: 'PostgreSQL', icon: <Shield />, desc: 'RBAC, JWT management, and Session security.' },
        { id: 'gig', title: 'Gig Service', tech: 'MongoDB', icon: <Box />, desc: 'Flexible schema for Gigs and Bids lifecycle.' },
        { id: 'ml', title: 'Recommendation', tech: 'FastAPI + VectorDB', icon: <Cpu />, desc: 'AI-driven similarity matching via embeddings.' },
        { id: 'comm', title: 'Comm Service', tech: 'Node.js + WebRTC', icon: <MessageSquare />, desc: 'Real-time chat and video signaling.' },
    ],
    infrastructure: [
        { name: 'Message Broker', tech: 'Apache Kafka', icon: <Activity />, desc: 'Event-driven backbone for service sync.' },
        { name: 'Search', tech: 'Elasticsearch', icon: <Layers />, desc: 'Full-text search and complex aggregations.' },
        { name: 'Cache', tech: 'Redis Cluster', icon: <Zap />, desc: 'Distributed session management and Pub/Sub.' },
    ]
};

export default function Architecture() {
    const [activeTab, setActiveTab] = useState('services');

    return (
        <section id="architecture" className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-16 items-start">

                {/* Left Side: Content & Controls */}
                <div className="lg:w-1/3 sticky top-32">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-4xl font-black mb-6 tracking-tighter">
                            Asynchronous <br />
                            <span className="text-brand">Microservices.</span>
                        </h2>
                        <p className="text-gray-400 font-medium mb-10 leading-relaxed">
                            GigFlow is built on a distributed event-driven mesh, ensuring 99.9% uptime and linear scalability for elite workflows.
                        </p>

                        <div className="flex flex-col gap-3 p-2 bg-[#161618] border border-white/5 rounded-2xl">
                            {['services', 'infrastructure'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all capitalize ${activeTab === tab
                                            ? 'bg-brand text-white shadow-lg shadow-brand/20'
                                            : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    {tab === 'services' ? <Server size={18} /> : <Hexagon size={18} />}
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: Interactive Grid */}
                <div className="lg:w-2/3 w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {(activeTab === 'services' ? architectureData.services : architectureData.infrastructure).map((item, i) => (
                                <div
                                    key={i}
                                    className="group relative p-8 rounded-[2rem] bg-[#161618] border border-white/5 hover:border-brand/30 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 bg-brand/10 text-brand rounded-2xl group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{item.tech}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{item.title || item.name}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Mermaid-style Flow Visualization Overlay (CSS-based) */}
            <div className="mt-20 p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] relative overflow-hidden">
                <div className="flex flex-wrap justify-center gap-8 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                    {/* Replace with actual SVGs or high-quality icons */}
                    <div className="flex flex-col items-center gap-2">
                        <Code2 className="text-brand" size={32} />
                        <span className="text-[10px] font-bold">SPRING BOOT 3</span>
                    </div>
                    <div className="w-px h-12 bg-white/10 hidden md:block" />
                    <div className="flex flex-col items-center gap-2">
                        <Activity className="text-orange-500" size={32} />
                        <span className="text-[10px] font-bold">KAFKA CLUSTER</span>
                    </div>
                    <div className="w-px h-12 bg-white/10 hidden md:block" />
                    <div className="flex flex-col items-center gap-2">
                        <Database className="text-blue-500" size={32} />
                        <span className="text-[10px] font-bold">POSTGRESQL + PGVECTOR</span>
                    </div>
                    <div className="w-px h-12 bg-white/10 hidden md:block" />
                    <div className="flex flex-col items-center gap-2 text-green-500">
                        <Box size={32} />
                        <span className="text-[10px] font-bold text-white">MONGODB 6</span>
                    </div>
                </div>
            </div>
        </section>
    );
}