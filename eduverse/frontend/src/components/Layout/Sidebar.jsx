import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Map as MapIcon,
    FlaskConical,
    Trophy,
    User,
    LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../Logo';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Mission Control', path: '/dashboard' },
        { icon: MapIcon, label: 'Star Map', path: '/roadmap' },
        { icon: FlaskConical, label: 'Lab', path: '/lab' },
        { icon: Trophy, label: 'Hall of Fame', path: '/achievements' },
        { icon: MapIcon, label: 'My Certificates', path: '/certificates' },
        { icon: User, label: 'Profile', path: '/profiling' },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        // "Abort Mission" now returns to Home (Landing Page)
        navigate('/');
    };

    return (
        <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            className="fixed left-0 top-0 h-full w-64 bg-[#050505]/90 backdrop-blur-xl border-r border-white/10 flex flex-col p-6 z-50 transition-all duration-300"
        >
            {/* Logo area */}
            <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer group" onClick={() => navigate('/')}>
                <div className="bg-white/5 p-2 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
                    <Logo className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        EduVerse
                    </h1>
                    <p className="text-[10px] text-indigo-400 tracking-[0.2em] font-bold uppercase">Expedition</p>
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${active
                                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                                }`}
                        >
                            {/* Active Glow Bar */}
                            {active && (
                                <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                            )}

                            <item.icon className={`w-5 h-5 ${active ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* User / Logout */}
            <div className="mt-auto pt-6 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-900/20 hover:text-red-400 transition-colors border border-transparent hover:border-red-900/30"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Abort Mission</span>
                </button>
            </div>
        </motion.div>
    );
}
