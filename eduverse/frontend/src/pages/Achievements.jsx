import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../services/api";

export default function Achievements() {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            fetchAchievements(u.id);
        }
    }, []);

    const fetchAchievements = async (userId) => {
        try {
            // Seed first ensures defaults exist (optional, but good for demo)
            await api.post("/achievements/seed");

            const res = await api.get(`/achievements/list/${userId}`);
            setAchievements(res.data);
        } catch (err) {
            console.error("Failed to load achievements", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-300 animate-pulse">Scanning Hall of Fame...</p>
                </div>
            </div>
        );
    }

    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);

    return (
        <div className="text-white pt-10 px-6 pb-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12 text-center">
                <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                    Hall of Fame
                </h1>
                <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
                    Your legacy in the EduVerse. Earn badges, gain XP, and rise through the ranks.
                </p>
            </div>

            {/* Stats Bar */}
            <div className="max-w-5xl mx-auto mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-2xl">
                        🏆
                    </div>
                    <div>
                        <p className="text-xs text-indigo-300 uppercase tracking-widest font-bold">Total Badges</p>
                        <p className="text-3xl font-bold">{unlocked.length} <span className="text-base text-gray-500">/ {achievements.length}</span></p>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center text-2xl">
                        ⚡
                    </div>
                    <div>
                        <p className="text-xs text-amber-300 uppercase tracking-widest font-bold">Total XP</p>
                        <p className="text-3xl font-bold text-amber-400">
                            {unlocked.reduce((sum, a) => sum + a.xp_reward, 0)}
                        </p>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-2xl">
                        🎖️
                    </div>
                    <div>
                        <p className="text-xs text-emerald-300 uppercase tracking-widest font-bold">Current Rank</p>
                        <p className="text-3xl font-bold text-emerald-400">Cadet</p>
                    </div>
                </div>
            </div>

            {/* Unlocked Section */}
            <div className="max-w-6xl mx-auto mb-16">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <span className="w-8 h-1 bg-gradient-to-r from-amber-500 to-transparent rounded-full"></span>
                    Unlocked Achievements
                    <span className="text-sm font-normal text-gray-500 ml-2">({unlocked.length})</span>
                </h2>

                {unlocked.length === 0 ? (
                    <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-12 text-center text-gray-500">
                        <p className="mb-2 text-4xl">🏜️</p>
                        <p>No achievements unlocked yet. Start your journey!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {unlocked.map((ach) => (
                            <motion.div
                                key={ach.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.03 }}
                                className="bg-gradient-to-br from-indigo-900/40 to-black border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden group shadow-[0_0_30px_rgba(245,158,11,0.1)]"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-50">
                                    <span className="text-4xl text-white/5 font-black">#{ach.id}</span>
                                </div>
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center text-3xl shadow-lg transform group-hover:rotate-6 transition-transform">
                                        {ach.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-amber-100">{ach.title}</h3>
                                        <p className="text-xs text-amber-500 font-bold mb-1">+{ach.xp_reward} XP</p>
                                        <p className="text-xs text-gray-400">Unlocked {new Date(ach.unlocked_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-indigo-100 leading-relaxed border-t border-white/5 pt-4">
                                    {ach.description}
                                </p>
                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Locked Section */}
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-400">
                    <span className="w-8 h-1 bg-slate-700 rounded-full"></span>
                    Next Targets
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {locked.map((ach) => (
                        <div key={ach.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 relative grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-2xl border-2 border-slate-700">
                                    {ach.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-300">{ach.title}</h3>
                                    <p className="text-xs text-slate-500 font-bold mb-2">+{ach.xp_reward} XP</p>
                                    <p className="text-xs text-slate-400">{ach.description}</p>
                                </div>
                            </div>
                            <div className="absolute top-4 right-4">
                                🔒
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
