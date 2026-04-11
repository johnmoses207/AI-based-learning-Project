import AgentCard from "../components/AgentCard";
import AgentChatModal from "../components/AgentChatModal";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';
import { motion } from "framer-motion";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import api from "../services/api";

export default function Dashboard() {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else if (location.state) {
            setUser(location.state);
        }
    }, [location]);

    const [roadmapProgress, setRoadmapProgress] = useState(null);

    useEffect(() => {
        if (user) {
            fetchAgentStatuses();
            const fetchProgress = async () => {
                try {
                    const res = await api.get(`/analytics/roadmap/${user.id}`);
                    setRoadmapProgress(res.data);
                } catch (e) {
                    console.error("Failed to fetch roadmap progress", e);
                }
            };
            fetchProgress();
        }
    }, [user]);

    const fetchAgentStatuses = async () => {
        if (!user || !user.id) return;

        const agentNames = ["Profiling Agent", "Curriculum Agent"];
        try {
            const promises = agentNames.map(name =>
                axios.get(`http://localhost:8000/api/agents/status/${user.id}/${name}`)
                    .then(res => ({ name, ...res.data }))
                    .catch(err => ({ name, status: "ERROR", error: err }))
            );

            const results = await Promise.all(promises);

            // Post-process logic for dependencies
            const profiling = results.find(r => r.name === "Profiling Agent");
            const curriculum = results.find(r => r.name === "Curriculum Agent");

            const processedAgents = [];

            // 1. Profiling Agent
            processedAgents.push({
                name: "Profiling Agent",
                status: profiling?.status || "IDLE",
                decision: profiling?.status === 'ERROR'
                    ? `Error: ${profiling.error.message || "Unknown"}`
                    : (profiling?.status === 'COMPLETED' ? "Profile Created" : "Needs Interview"),
                confidence: profiling?.status === 'COMPLETED' ? `${profiling.data?.confidence || 95}%` : "0%",
                actionLabel: profiling?.status === 'COMPLETED' ? "Review / Redo" : "Start Interview",
                enabled: true
            });

            // 2. Curriculum Agent (Depends on Profiling)
            const isProfilingDone = profiling?.status === 'COMPLETED';
            processedAgents.push({
                name: "Curriculum Agent",
                status: !isProfilingDone ? "LOCKED" : (curriculum?.status || "IDLE"),
                decision: !isProfilingDone ? "Waiting for Profiling" : (curriculum?.status === 'COMPLETED' ? "Roadmap Ready" : "Ready to Generate"),
                confidence: curriculum?.status === 'COMPLETED' ? `${curriculum.data?.confidence || 90}%` : "0%",
                actionLabel: !isProfilingDone ? "Locked" : (curriculum?.status === 'COMPLETED' ? "View Roadmap" : "Go to Profiling"),
                enabled: isProfilingDone
            });

            // 3. Assessment Agent (Independent or Module Locked - Independent for now)
            processedAgents.push({
                name: "Assessment Agent",
                status: "IDLE", // Or fetch real status if needed
                decision: "Exam Certification",
                confidence: "100%", // Deterministic
                actionLabel: "Take Exam",
                enabled: true
            });

            setAgents(processedAgents);

        } catch (err) {
            console.error("Error fetching agents", err);
        }
    };

    const handleAgentClick = (agent) => {
        if (!agent.enabled) return;

        if (agent.name === "Assessment Agent") {
            navigate("/assessment");
            return;
        }

        if (agent.name === "Profiling Agent") {
            navigate("/profiling");
            return;
        }

        if (agent.name === "Curriculum Agent") {
            if (agent.status === "COMPLETED") {
                navigate("/roadmap");
            } else {
                navigate("/profiling");
            }
            return;
        }

        setSelectedAgent(agent.name);
        setIsChatOpen(true);
    };

    const handleChatComplete = (data) => {
        fetchAgentStatuses();
    };

    const handleGenerateCourse = async () => {
        if (!user) return;
        const confirm = window.confirm("This will generate ~30 new questions based on your roadmap. It may take a minute. Continue?");
        if (!confirm) return;

        try {
            await api.post(`/lab/seed/${user.id}`);
            alert("Course content generated successfully! You can now start the Lab.");
        } catch (err) {
            console.error(err);
            alert("Failed to generate content. Make sure your roadmap is ready.");
        }
    };

    return (
        <div className="text-white">

            <AgentChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                agentName={selectedAgent}
                userId={user?.id}
                onComplete={handleChatComplete}
            />

            {/* User Profile Section */}
            {user && (
                <>
                    <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Mission Control</span>
                    </h1>

                    <div className="max-w-6xl mx-auto mb-10 p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-500 shadow-lg shrink-0">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-indigo-800 flex items-center justify-center text-2xl font-bold">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Welcome, Explorer!</h2>
                                <p className="text-indigo-200 mb-2">{user.email}</p>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/50">
                                        {user.role || "Cadet"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {user.role === 'admin' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                            >
                                <span>🛡️</span>
                                <span>Admin Panel</span>
                            </button>
                        )}
                    </div>

                    {/* Live Analytics Dashboard */}
                    <div className="max-w-6xl mx-auto">
                        <AnalyticsDashboard userId={user.id} />
                    </div>
                </>
            )}

            {/* Roadmap Progress Card */}
            {roadmapProgress && roadmapProgress.modules && roadmapProgress.modules.length > 0 && (
                <div className="max-w-6xl mx-auto mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-white/10 p-8 rounded-2xl md:col-span-2"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                                <span className="text-3xl">🗺️</span> Roadmap Tracker
                            </h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleGenerateCourse}
                                    className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/50 text-indigo-300 text-xs font-bold rounded uppercase tracking-wider transition-colors"
                                >
                                    ⚡ Build Course
                                </button>
                                <div className="text-right">
                                    <p className="text-gray-400 text-sm">Overall Completion</p>
                                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                        {roadmapProgress.overall_progress}%
                                    </p>
                                </div>
                                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 flex items-center justify-center relative">
                                    <svg className="w-full h-full absolute top-0 left-0 transform -rotate-90">
                                        <circle
                                            cx="32" cy="32" r="28"
                                            fill="transparent"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            className="text-indigo-500"
                                            strokeDasharray={`${(roadmapProgress.overall_progress / 100) * 175}, 175`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {roadmapProgress.modules.map((mod, idx) => (
                                <div key={idx} className="relative bg-black/20 p-6 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className={`text-lg font-bold ${idx === roadmapProgress.current_module_index ? "text-white" : "text-gray-400"}`}>
                                                {mod.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {mod.completed} of {mod.total} Topics Completed
                                            </p>
                                        </div>
                                        {mod.status === "completed" && (
                                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                Completed
                                            </span>
                                        )}
                                    </div>

                                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${mod.percentage}%` }}
                                            transition={{ duration: 1, delay: 0.1 * idx }}
                                            className={`h-full ${mod.status === "completed" ? "bg-green-500" :
                                                idx === roadmapProgress.current_module_index ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-gray-600"
                                                }`}
                                        />
                                    </div>

                                    {/* Action Button for Current Module */}
                                    {idx === roadmapProgress.current_module_index && mod.next_topic && (
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => navigate("/lab", { state: { topic: mod.next_topic } })}
                                                className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all hover:translate-x-1"
                                            >
                                                <span>Resume: {mod.next_topic}</span>
                                                <span className="group-hover:translate-x-1 transition-transform">➔</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            <h2 className="text-2xl font-bold mb-6 text-slate-300">Active Agents</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {agents.map((agent, index) => (
                    <AgentCard
                        key={index}
                        {...agent}
                        onClick={agent.enabled ? () => handleAgentClick(agent) : null}
                    />
                ))}
            </div>
        </div>
    );
}
