import { Link } from 'react-router-dom';
import { ArrowRight, Code, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 -left-20 w-[500px] h-[500px] rounded-full bg-indigo-100/50 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 max-w-4xl mx-auto leading-tight">
            The next generation workspace for <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">elite freelancers.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect, collaborate, and build faster. GigFlow combines AI recommendations with a seamless gig matching engine to power your freelance career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup" className="group flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-full text-lg font-semibold transition-all hover:shadow-xl hover:shadow-gray-900/20 hover:-translate-y-1 w-full sm:w-auto">
              Get Started for Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/explore" className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold transition-all w-full sm:w-auto shadow-sm">
              Explore Open Gigs
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why choose GigFlow?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Matching</h3>
              <p className="text-gray-600">Our machine learning engine finds the perfect projects for your skills, so you spend less time searching.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Code size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Developer First</h3>
              <p className="text-gray-600">Built specifically for technical talent, with built-in code spaces, real-time collaboration, and git integration.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payments</h3>
              <p className="text-gray-600">Get paid on time, every time. Smart contracts and escrow guarantee your compensation is safe.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
