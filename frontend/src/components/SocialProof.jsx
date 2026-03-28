// components/SocialProof.jsx
export default function SocialProof() {
    return (
        <section className="py-10 border-y border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-6 overflow-hidden">
                <p className="text-center text-gray-500 text-sm mb-8 uppercase tracking-widest">Trusted by the world's best teams</p>
                <div className="flex justify-around items-center opacity-30 grayscale gap-8 flex-wrap">
                    {/* Replace with actual SVGs later */}
                    <span className="text-2xl font-bold italic">BRAVE</span>
                    <span className="text-2xl font-bold">DRATA</span>
                    <span className="text-2xl font-bold">DECATHLON</span>
                    <span className="text-2xl font-bold">RAYCAST</span>
                    <span className="text-2xl font-bold">CANADA</span>
                </div>
            </div>
        </section>
    );
}