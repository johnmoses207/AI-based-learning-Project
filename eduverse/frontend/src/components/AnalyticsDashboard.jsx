import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { motion } from 'framer-motion';

export default function AnalyticsDashboard({ userId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        fetchAnalytics();
    }, [userId]);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/analytics/progress/${userId}`);
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch analytics", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white/50 text-sm animate-pulse">Loading Analytics...</div>;
    if (!data || !data.recent_scores || data.recent_scores.length === 0) {
        return null;
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md">
                    <p className="text-indigo-300 text-xs font-bold mb-1">{label}</p>
                    <p className="text-white text-sm font-bold">
                        Score: <span className="text-indigo-400">{payload[0].value}%</span>
                    </p>
                    <p className="text-slate-400 text-xs">Topic: {payload[0].payload.topic}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl mb-8 relative overflow-hidden"
        >
            {/* Glow Effects */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 relative z-10">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    Live Analytics
                </span>
                <span className="text-xl">📊</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
                {/* Stat Cards */}
                <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all group">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Average Score</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-bold text-white group-hover:text-indigo-400 transition-colors">{data.average_score}</p>
                        <span className="text-sm text-slate-500">%</span>
                    </div>
                </div>
                <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all group">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tests Taken</p>
                    <p className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">{data.total_assessments}</p>
                </div>
                <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all group">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Topics Mastered</p>
                    <p className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">{data.topics_completed}</p>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-72 relative z-10">
                {/* Progress Area Chart */}
                <div className="w-full h-full bg-slate-800/20 rounded-xl p-4 border border-white/5">
                    <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Performance Trend</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.recent_scores}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#818cf8"
                                fillOpacity={1}
                                fill="url(#colorScore)"
                                strokeWidth={3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Topic Breakdown Bar Chart */}
                <div className="w-full h-full bg-slate-800/20 rounded-xl p-4 border border-white/5">
                    <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Recent Topics</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.recent_scores.slice(-5)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="topic" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-10} textAnchor="end" height={20} axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" hide />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                            <Bar dataKey="score" fill="#c084fc" radius={[4, 4, 4, 4]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
}
