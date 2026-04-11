import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Profiling() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        skill: "",
        goal: "",
        hours: "",
        style: "",
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const onChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        const user = JSON.parse(localStorage.getItem("user"));
        try {
            const res = await api.post("/profiling", {
                ...form,
                hours: Number(form.hours),
                user_id: user?.id
            });
            setResult(res.data);
        } catch (err) {
            setError("Profiling failed. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCurriculum = async () => {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        try {
            const res = await api.post("/curriculum", {
                ...form,
                hours: Number(form.hours),
                user_id: user?.id
            });

            // Save to local storage for Roadmap page
            // Response format: { agent, status, decision, confidence, data: { title, modules: [...] } }
            const roadmapData = res.data.data;

            localStorage.setItem("roadmapData", JSON.stringify({
                profile: form,
                roadmap: roadmapData
            }));

            navigate("/roadmap");
        } catch (err) {
            setError("Failed to generate curriculum. Agent might be busy.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-6 text-white pt-24">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-white/10">
                <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    Profiling Agent
                </h1>

                {/* FORM */}
                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300 ml-1">Current Skill Level</label>
                        <select
                            name="skill"
                            required
                            onChange={onChange}
                            className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all text-white placeholder-gray-500"
                        >
                            <option value="">Select Skill Level</option>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-300 ml-1">Learning Goal</label>
                        <input
                            name="goal"
                            placeholder="e.g. Master React, Learn Python Data Science"
                            required
                            onChange={onChange}
                            className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all text-white placeholder-gray-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-300 ml-1">Daily Study Hours</label>
                        <input
                            type="number"
                            name="hours"
                            placeholder="e.g. 2"
                            required
                            onChange={onChange}
                            className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all text-white placeholder-gray-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-300 ml-1">Preferred Style</label>
                        <select
                            name="style"
                            required
                            onChange={onChange}
                            className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:outline-none transition-all text-white placeholder-gray-500"
                        >
                            <option value="">Select Learning Style</option>
                            <option>Visual (Videos, Diagrams)</option>
                            <option>Practical (Projects, Coding)</option>
                            <option>Theory (Reading, Concepts)</option>
                        </select>
                    </div>

                    {!result && (
                        <button
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                    Analyzing...
                                </span>
                            ) : "Run Profiling"}
                        </button>
                    )}
                </form>

                {/* ERROR */}
                {error && (
                    <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* LOADING OVERLAY for Curriculum */}
                {loading && result && (
                    <div className="mt-8 text-center text-indigo-300 animate-pulse">
                        Building your curriculum...
                    </div>
                )}

                {/* RESULT */}
                {result && !loading && (
                    <div className="mt-8 bg-black/40 rounded-xl p-6 border border-white/10 animate-fade-in">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                            <span className="font-bold text-indigo-300 flex items-center gap-2">
                                🤖 {result.agent}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                {result.status}
                            </span>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Observation</p>
                            <p className="text-white text-lg leading-relaxed font-medium">
                                "{result.decision}"
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Confidence Score</span>
                                <span>{result.confidence}%</span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${result.confidence}%` }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateCurriculum}
                            className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold border border-white/20 transition-all flex items-center justify-center gap-2"
                        >
                            🚀 Build My Curriculum
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
