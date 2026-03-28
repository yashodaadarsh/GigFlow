import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess } from '../redux/slices/auth.slice';
import api from '../api/api';
import { motion } from 'framer-motion';
import { Hexagon, Shield, Terminal, ArrowRight, Lock } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await api.post('/auth/login', { email, password });
            dispatch(loginSuccess({
                user: { id: data.userId, name: data.name, role: data.role },
                token: data.token
            }));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'AUTH_FAILURE: Check credentials.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            {/* Background Engineering Elements */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`, backgroundSize: '60px 60px' }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#10b981]/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 relative z-10"
            >
                {/* Brand Identity */}
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 bg-[#10b981] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <Hexagon size={28} className="text-[#0A0A0B] fill-[#0A0A0B]" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                        Console_Auth
                    </h2>
                    <p className="mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">
                        Establish Secure Session Link
                    </p>
                </div>

                <div className="bg-[#111111] border border-white/10 p-10 rounded-2xl shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-50" />

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[#10b981] text-[10px] font-black uppercase tracking-widest text-center bg-[#10b981]/10 p-3 border border-[#10b981]/20 rounded"
                            >
                                <span className="mr-2">⚠️</span> {error}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1 group-focus-within:text-[#10b981] transition-colors">
                                    Identity_Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#10b981] transition-colors">
                                        <Terminal size={14} />
                                    </div>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        required
                                        className="appearance-none block w-full pl-11 pr-4 py-3 bg-[#0A0A0B] border border-white/10 placeholder-gray-700 text-white font-bold text-sm rounded-lg focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 transition-all"
                                        placeholder="root@gigflow.io"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1 group-focus-within:text-[#10b981] transition-colors">
                                    Access_Key
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#10b981] transition-colors">
                                        <Lock size={14} />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="appearance-none block w-full pl-11 pr-4 py-3 bg-[#0A0A0B] border border-white/10 placeholder-gray-700 text-white font-bold text-sm rounded-lg focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/20 transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-4 px-4 border-2 border-[#10b981]/40 text-xs font-black uppercase tracking-[0.3em] rounded-lg text-[#10b981] bg-transparent hover:bg-[#10b981] hover:text-[#0A0A0B] transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.1)] active:scale-95"
                            >
                                [ Initialize_Session ]
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                            New Node?{' '}
                            <Link to="/signup" className="text-[#10b981] hover:text-white transition-colors underline decoration-[#10b981]/30">
                                Register_Identity
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Status Metadata */}
                <div className="flex justify-between items-center px-2 opacity-30">
                    <div className="flex items-center gap-2">
                        <Shield size={10} className="text-[#10b981]" />
                        <span className="text-[8px] font-black text-white uppercase tracking-tighter">TLS_1.3_Active</span>
                    </div>
                    <span className="text-[8px] font-black text-white uppercase tracking-tighter italic">Auth_Node: 01_S_BOOT</span>
                </div>
            </motion.div>
        </div >
    );
}