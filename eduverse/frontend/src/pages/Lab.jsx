import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CodeChallenge from "../components/CodeChallenge";
import QuizChallenge from "../components/QuizChallenge";
import api from "../services/api";

export default function Lab() {
    const location = useLocation();
    const [topic, setTopic] = useState(location.state?.topic || "Python Basics");
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(false);
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);

    const [personalizedGoal, setPersonalizedGoal] = useState(null);

    useEffect(() => {
        if (location.state?.topic) return; // Prioritize passed topic

        const fetchProfile = async () => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user) {
                try {
                    // 1. Check Roadmap (Priority)
                    const roadmapRes = await api.get(`/agents/status/${user.id}/Curriculum Agent`);
                    if (roadmapRes.data.status === "COMPLETED" && roadmapRes.data.data?.data?.modules) {
                        const modules = roadmapRes.data.data.data.modules;
                        if (modules.length > 0 && modules[0].topics.length > 0) {
                            setTopic("Recommended");
                            setPersonalizedGoal(`Roadmap: ${modules[0].topics[0]}`);
                            return;
                        }
                    }

                    // 2. Check Profiling (Fallback)
                    const res = await api.get(`/agents/status/${user.id}/Profiling Agent`);
                    if (res.data.status === "COMPLETED" && res.data.data?.goal) {
                        setTopic("Recommended");
                        setPersonalizedGoal(res.data.data.goal);
                    }
                } catch (e) {
                    console.log("No profile found");
                }
            }
        };
        fetchProfile();
    }, []);

    const generateChallenge = async () => {
        setLoading(true);
        setChallenge(null);
        setUnlockedAchievements([]);
        const user = JSON.parse(localStorage.getItem("user"));

        try {
            const res = await api.post("/lab/challenge", {
                topic: topic,
                difficulty: "Beginner",
                user_id: user?.id
            });
            if (res.data.status === "success") {
                setChallenge(res.data.challenge);
            }
        } catch (err) {
            console.error("Failed to generate challenge", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChallengeComplete = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        try {
            const res = await api.post("/lab/submit", {
                user_id: user.id,
                topic: topic,
                code: "Verified Code",
                passed: true
            });

            // Handle Achievements
            if (res.data.unlocked_achievements && res.data.unlocked_achievements.length > 0) {
                setUnlockedAchievements(res.data.unlocked_achievements);
                // Clear achievements notification after 5 seconds
                setTimeout(() => setUnlockedAchievements([]), 5000);
            }

            // Success Feedback & Next Question
            // We use a small timeout to let the user see the "Success" state on the button/console
            setTimeout(() => {
                alert("🎉 Correct! Moving to the next challenge...");
                generateChallenge();
            }, 1000);

        } catch (err) {
            console.error("Submission failed", err);
        }
    };

    return (
        <div className="min-h-screen pt-24 bg-gradient-to-br from-gray-900 via-indigo-950 to-black px-6 py-10 text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">The Lab 🧪</h1>
                        <p className="text-gray-400">Practice coding, earn badges, and master your skills.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar / Controls */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
                        <h2 className="text-xl font-semibold mb-6">Configuration</h2>

                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">Select Topic</label>
                            <select
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="Recommended">
                                    ✨ Recommended {personalizedGoal ? `(${personalizedGoal})` : ""}
                                </option>
                                <option>Python Basics</option>
                                <option>Data Structures</option>
                                <option>Algorithms</option>
                                <option>Web Development</option>
                                <option>Machine Learning</option>
                            </select>
                        </div>

                        <button
                            onClick={generateChallenge}
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-wait"
                        >
                            {loading ? "Generating..." : "✨ Generate New Challenge"}
                        </button>
                    </div>

                    {/* Main Challenge Area */}
                    <div className="md:col-span-2">
                        {unlockedAchievements.length > 0 && (
                            <div className="mb-8 p-4 bg-green-500/20 border border-green-500/50 rounded-xl animate-bounce-in">
                                <h3 className="text-green-400 font-bold text-lg mb-2">🏆 Achievement Unlocked!</h3>
                                <ul className="list-disc list-inside text-green-200">
                                    {unlockedAchievements.map(a => <li key={a}>{a}</li>)}
                                </ul>
                            </div>
                        )}

                        {!challenge ? (
                            <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-2xl text-gray-500">
                                <span className="text-4xl mb-4">🧬</span>
                                <p>Select a topic and hit Generate to start practicing.</p>
                            </div>
                        ) : challenge.type === "quiz" ? (
                            <QuizChallenge
                                challenge={challenge}
                                onComplete={handleChallengeComplete}
                            />
                        ) : (
                            <CodeChallenge
                                challenge={challenge}
                                onComplete={handleChallengeComplete}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
