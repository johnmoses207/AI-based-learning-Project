import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Roadmap() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [roadmapData, setRoadmapData] = useState(null);

    useEffect(() => {
        const dataStr = localStorage.getItem("roadmapData");
        if (dataStr) {
            const data = JSON.parse(dataStr);
            setProfile(data.profile);
            setRoadmapData(data.roadmap);
        }
    }, []);

    if (!roadmapData) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Roadmap...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-8 text-white pt-24">
            <h1 className="text-4xl font-bold text-center mb-4">
                {roadmapData.title || "Your Learning Roadmap"}
            </h1>
            <p className="text-center text-indigo-200 mb-10 max-w-2xl mx-auto">
                Based on your goal to <b>{profile?.goal}</b> as a <b>{profile?.skill}</b>.
            </p>

            {/* Roadmap Timeline */}
            <div className="max-w-4xl mx-auto space-y-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-white/10 hidden md:block"></div>

                {roadmapData.modules && roadmapData.modules.map((mod, index) => (
                    <div
                        key={index}
                        className="relative flex flex-col md:flex-row gap-6 group"
                    >
                        {/* Circle Marker */}
                        <div className="absolute left-8 -translate-x-1/2 w-4 h-4 bg-indigo-500 rounded-full border-4 border-gray-900 hidden md:block mt-6 group-hover:scale-125 transition-transform z-10"></div>

                        <div className="hidden md:flex w-24 shrink-0 flex-col items-end pt-5 pr-8 text-right">
                            <span className="font-bold text-indigo-300">{mod.duration || `Week ${index + 1}`}</span>
                        </div>

                        <div className="flex-1 bg-white/5 backdrop-blur-lg border border-white/10 hover:border-indigo-500/50 p-6 rounded-2xl transition-all hover:bg-white/10 hover:-translate-y-1 shadow-lg">
                            <h3 className="text-xl font-bold mb-2 flex justify-between items-start">
                                {mod.title}
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">{mod.description}</p>

                            <div className="flex flex-wrap gap-2">
                                {mod.topics && mod.topics.map((topic, i) => (
                                    <span
                                        key={i}
                                        onClick={() => navigate(`/learn?topic=${encodeURIComponent(topic)}`)}
                                        className="bg-black/30 hover:bg-indigo-600 hover:text-white px-3 py-1 rounded-lg text-xs cursor-pointer transition-colors border border-white/5"
                                    >
                                        ▶ {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-12 pb-12">
                <button onClick={() => navigate('/profiling')} className="text-gray-400 hover:text-white underline">
                    Restart Profiling
                </button>
            </div>
        </div>
    );
}
