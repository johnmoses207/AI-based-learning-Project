import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

export default function Assessment() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [examId, setExamId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({}); // { qId: "Answer" }
    const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
    const [isActive, setIsActive] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    // Registration State
    const [regEmail, setRegEmail] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleSubmit(); // Auto submit
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleRegister = async () => {
        if (!user) return;
        if (!regEmail) {
            alert("Please enter your email to register.");
            return;
        }

        setIsSubmitting(true);
        try {
            const topic = location.state?.topic || "Comprehensive Final";
            // Call Register Endpoint
            const res = await api.post("/assessment/register", {
                user_id: user.id,
                email: regEmail,
                topic: topic
            });

            setExamId(res.data.unique_exam_id);
            setIsRegistered(true);
            alert(`Registration Successful!\nUnique Exam ID: ${res.data.unique_exam_id}`);

            // Auto-start
            await startExam(res.data.unique_exam_id);

        } catch (err) {
            console.error("Registration failed", err);
            if (err.response && err.response.status === 403) {
                alert("Registration Failed: Email must match your login email.");
            } else {
                alert("Registration failed. Please try again.");
            }
            setIsSubmitting(false);
        }
    };

    const startExam = async (id) => {
        const res = await api.get(`/assessment/start/${id}?user_id=${user.id}`);
        setQuestions(res.data.questions);
        setTimeLeft(res.data.duration_minutes * 60);
        setIsActive(true);
        setIsSubmitting(false);
    };

    const handleSelectOption = (qId, option) => {
        setAnswers(prev => ({ ...prev, [qId]: option }));
    };

    const handleSubmit = async () => {
        setIsActive(false);
        setIsSubmitting(true);
        try {
            const payload = {
                user_id: user.id,
                exam_id: examId,
                answers: Object.entries(answers).map(([id, ans]) => ({ id, answer: ans }))
            };
            const res = await api.post("/assessment/submit", payload);
            setResult(res.data);
        } catch (err) {
            console.error("Submit failed", err);
            alert("Submission failed. Please check connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (result) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-6">
                <div className="bg-white/10 p-10 rounded-2xl border border-white/20 text-center max-w-lg w-full">
                    <div className="text-6xl mb-4">{result.passed ? "🏆" : "⚠️"}</div>
                    <h1 className="text-3xl font-bold mb-2">{result.passed ? "PASSED" : "FAILED"}</h1>
                    <p className="text-xl text-gray-300 mb-6">Score: {result.score.toFixed(1)}%</p>

                    <div className="bg-black/40 p-4 rounded-lg mb-6 text-sm font-mono text-gray-500 break-all">
                        Hash: {result.hash}
                    </div>

                    <div className="flex flex-col gap-4">
                        {result.certificate && (
                            <a
                                href={`http://localhost:8000${result.certificate.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:scale-105 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                            >
                                📜 Download Certificate
                            </a>
                        )}
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return <div className="p-10 text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            <Navbar />
            <div className="max-w-4xl mx-auto p-6 pt-24">

                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold">🛡️ High Stakes Assessment</h1>
                        <p className="text-gray-400 text-sm">Strict Environment • Immutable Results</p>
                    </div>
                    {isActive && (
                        <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? "text-red-500 animate-pulse" : "text-indigo-400"}`}>
                            ⏱ {formatTime(timeLeft)}
                        </div>
                    )}
                </div>

                {!isActive && !isSubmitting && !isRegistered && (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                        <div className="text-6xl mb-6">📝</div>
                        <h2 className="text-2xl font-bold mb-4">Exam Registration</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            To maintain academic integrity, please confirm your identity.
                            The email must match your registered account: <b>{user.email}</b>
                        </p>

                        <div className="max-w-sm mx-auto flex flex-col gap-4">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                className="px-4 py-3 bg-black/40 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                            />

                            <button
                                onClick={handleRegister}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
                            >
                                Register & Start
                            </button>
                        </div>

                        <div className="mt-8 text-xs text-gray-500">
                            • 100 Questions • 90 Minutes • No Retakes
                        </div>
                    </div>
                )}

                {isSubmitting && (
                    <div className="text-center py-20">
                        <div className="animate-spin text-4xl mb-4">⚙️</div>
                        <p>Processing Assessment Agent...</p>
                    </div>
                )}

                {isActive && (
                    <div className="space-y-8">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="bg-white/5 p-6 rounded-xl border border-white/10">
                                <div className="flex gap-4 mb-4">
                                    <span className="bg-indigo-500/20 text-indigo-300 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0">
                                        {idx + 1}
                                    </span>
                                    <h3 className="text-lg font-medium">{q.text}</h3>
                                </div>
                                <div className="space-y-2 ml-12">
                                    {q.options.map((opt, oIdx) => (
                                        <label
                                            key={oIdx}
                                            className={`block p-3 rounded-lg border cursor-pointer transition-all
                                                ${answers[q.id] === opt
                                                    ? "bg-indigo-600/20 border-indigo-500 text-white"
                                                    : "bg-black/20 border-gray-700 hover:bg-white/5 text-gray-300"
                                                }
                                            `}
                                        >
                                            <input
                                                type="radio"
                                                name={q.id}
                                                value={opt}
                                                checked={answers[q.id] === opt}
                                                onChange={() => handleSelectOption(q.id, opt)}
                                                className="hidden"
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end pt-8 pb-20">
                            <button
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to finish?")) handleSubmit();
                                }}
                                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg"
                            >
                                Submit Exam
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
