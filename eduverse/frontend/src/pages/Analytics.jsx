import { useEffect, useState } from "react";
import ProgressChart from "../components/ProgressChart";
import api from "../services/api"; // Ensure api is imported

export default function Analytics() {
    const [confidenceData, setConfidenceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user) {
                try {
                    const res = await api.get(`/analytics/confidence/${user.id}`);
                    setConfidenceData(res.data);
                } catch (err) {
                    console.error("Failed to load analytics", err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchAnalytics();
    }, []);

    const progressData = [
        { week: "Week 1", score: 60 },
        { week: "Week 2", score: 72 },
        { week: "Week 3", score: 80 },
        { week: "Week 4", score: 88 },
        { week: "Week 5", score: 92 },
    ];

    return (
        <div className="min-h-screen pt-24 bg-gradient-to-br from-black via-indigo-900 to-purple-900 px-6 py-10 text-white">
            <h1 className="text-4xl font-bold text-center mb-10">
                Learning Analytics
            </h1>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Progress Chart */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Performance Over Time
                    </h2>
                    <ProgressChart data={progressData} />
                </div>

                {/* AI Confidence Protocol (Live) */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4 text-cyan-400">
                        Confidence Protocol Metrics
                    </h2>

                    {loading ? (
                        <p className="text-gray-400">Loading protocol data...</p>
                    ) : confidenceData.length === 0 ? (
                        <p className="text-gray-400">No active agents found. Start a module to see metrics.</p>
                    ) : (
                        <div className="space-y-6">
                            {confidenceData.map((agent, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-2 text-gray-300">
                                        <span>{agent.agent}</span>
                                        <span className={agent.confidence > 80 ? "text-green-400" : "text-yellow-400"}>
                                            {agent.confidence}% Confidence
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${agent.confidence > 80 ? "bg-gradient-to-r from-green-400 to-emerald-500" :
                                                    agent.confidence > 50 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                                                        "bg-red-500"
                                                }`}
                                            style={{ width: `${agent.confidence}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-indigo-900/40 rounded-xl border border-indigo-500/20">
                        <p className="font-semibold text-indigo-300 mb-2">
                            Mentor Agent Insight
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {confidenceData.some(c => c.confidence > 85)
                                ? "The AI agents are highly confident in your current trajectory. The Curriculum Agent suggests advancing to more complex topics."
                                : "Confidence scores indicate some uncertainty in the generated plan. Consider refining your profile goals for better alignment."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
