import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import mermaid from "mermaid";
import api from "../services/api";
import CodeChallenge from "../components/CodeChallenge";

export default function Learn() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const topic = params.get("topic");

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [challenge, setChallenge] = useState(null);
    const [generatingChallenge, setGeneratingChallenge] = useState(false);

    const handleCompleteLesson = async () => {
        setGeneratingChallenge(true);
        const user = JSON.parse(localStorage.getItem("user"));

        try {
            // 1. Log Completion
            if (user) {
                await api.post("/learn/complete", { user_id: user.id, topic: data.topic });
            }

            // 2. Navigate to Lab with topic
            navigate('/lab', { state: { topic: data.topic } });

        } catch (err) {
            console.error("Failed to complete lesson", err);
            setGeneratingChallenge(false);
        }
    };


    useEffect(() => {
        mermaid.initialize({ startOnLoad: false });
    }, []);

    useEffect(() => {
        if (!topic) return;

        api
            .post("/learn/topic", { topic })
            .then((res) => {
                // MCP format: { agent, status, data: { ...content } }
                const content = res.data.data;
                setData(content);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Learn Agent failed", err);
                setLoading(false);
            });
    }, [topic]);

    useEffect(() => {
        if (data?.mermaid_diagram) {
            setTimeout(() => {
                mermaid.run({
                    nodes: [document.querySelector(".mermaid")],
                });
            }, 500);
        }
    }, [data]);

    const renderMarkdown = (text) => {
        if (!text) return null;
        return text.split("\n").map((line, i) => (
            <p key={i} className="mb-2" dangerouslySetInnerHTML={{
                __html: line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            }} />
        ));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading AI lesson...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-8 text-white">
            <h1 className="text-4xl font-bold mb-6">{data.topic}</h1>

            {/* Markdown Content (Point-wise) */}
            {data.markdown_content && (
                <div className="bg-white/10 p-6 rounded-xl mb-8">
                    <h2 className="text-xl font-semibold mb-3">Key Points</h2>
                    <div className="text-gray-200 leading-relaxed">
                        {renderMarkdown(data.markdown_content)}
                    </div>
                </div>
            )}

            {/* Flashcards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {data.flashcards?.map((card, idx) => (
                    <div
                        key={idx}
                        className="bg-white/10 p-6 rounded-xl hover:bg-white/20 transition group"
                    >
                        <h3 className="text-xl font-bold text-indigo-300 mb-2">
                            {card.front}
                        </h3>
                        <p className="text-gray-200">{card.back}</p>
                    </div>
                ))}
            </div>

            {/* Flow Diagram (Mermaid) */}
            {data.mermaid_diagram && (
                <div className="bg-white/10 p-6 rounded-xl mb-8 overflow-x-auto">
                    <h2 className="text-xl font-semibold mb-4">Concept Flow</h2>
                    <div className="mermaid bg-white p-4 rounded-xl text-black">
                        {data.mermaid_diagram}
                    </div>
                </div>
            )}

            {/* Video Content (AI) */}
            {/* Video Content (AI) + Verified Resources */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.video_recommendations && (
                    <div className="bg-white/10 p-6 rounded-xl">
                        <h2 className="text-xl font-semibold mb-4 text-purple-300">AI Recommended Videos</h2>
                        <ul className="space-y-3">
                            {data.video_recommendations.map((video, i) => (
                                <li key={i}>
                                    <a
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-300 hover:underline flex items-center gap-2"
                                    >
                                        <span>▶</span> {video.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Admin Verified Resources (New) */}
                <VerifiedResources />
            </div>

            <div className="mt-16 text-center pb-20 border-t border-white/10 pt-12">
                {!challenge ? (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-indigo-200 mb-4">Mastered this topic? Prove it.</p>
                        <button
                            onClick={handleCompleteLesson}
                            disabled={generatingChallenge}
                            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-wait flex items-center gap-3"
                        >
                            {generatingChallenge ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>⚔️</span>
                                    <span>Complete & Go to Lab</span>
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade-in text-left max-w-5xl mx-auto">
                        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg mb-8 text-center">
                            <h3 className="text-green-400 font-bold flex items-center justify-center gap-2">
                                <span>✅</span> Lesson Completed!
                            </h3>
                            <p className="text-green-200 text-sm">Your progress has been tracked by your mentor.</p>
                        </div>

                        <h2 className="text-2xl font-bold mb-4 text-center">Now, solve this.</h2>
                        <CodeChallenge
                            challenge={challenge}
                            onComplete={() => console.log("Challenge Solved!")}
                        />

                        <div className="mt-12 text-center">
                            <button
                                onClick={() => navigate(`/assessment?topic=${encodeURIComponent(topic)}`)}
                                className="text-gray-400 hover:text-white underline text-sm"
                            >
                                Skip to Formal Assessment
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function VerifiedResources() {
    const [resources, setResources] = useState([]);

    useEffect(() => {
        api.get("/resources").then(res => setResources(res.data));
    }, []);

    if (resources.length === 0) return null;

    return (
        <div className="bg-white/10 p-6 rounded-xl border border-green-500/30">
            <h2 className="text-xl font-semibold mb-4 text-green-400 flex items-center gap-2">
                <span>📚</span> Verified Library Resources
            </h2>
            <ul className="space-y-3">
                {resources.map((r, i) => (
                    <li key={i} className="flex flex-col">
                        <a
                            href={r.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-300 hover:underline font-medium"
                        >
                            {r.title}
                        </a>
                        <span className="text-xs text-gray-400">{r.type} • {r.category}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
