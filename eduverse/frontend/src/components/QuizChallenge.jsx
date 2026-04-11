import { useState } from "react";
import { motion } from "framer-motion";

export default function QuizChallenge({ challenge, onComplete }) {
    const [selected, setSelected] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleSubmit = () => {
        if (!selected) return;
        setSubmitted(true);
        const correct = selected === challenge.correct_answer;
        setIsCorrect(correct);
        if (correct) {
            onComplete();
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-mono">
                        QUIZ MODE
                    </span>
                    <span className="text-gray-400 text-sm">Difficulty: {challenge.difficulty || "Beginner"}</span>
                </div>

                <h2 className="text-2xl font-bold mb-8 text-white">{challenge.question}</h2>

                <div className="space-y-4">
                    {challenge.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => !submitted && setSelected(option)}
                            disabled={submitted}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${selected === option
                                    ? "border-indigo-500 bg-indigo-500/20 text-white"
                                    : "border-gray-700 bg-black/20 text-gray-300 hover:border-gray-500"
                                } ${submitted && option === challenge.correct_answer
                                    ? "border-green-500 bg-green-500/20 !text-white"
                                    : ""
                                } ${submitted && selected === option && !isCorrect
                                    ? "border-red-500 bg-red-500/20"
                                    : ""
                                }`}
                        >
                            <span className="font-mono opacity-50 mr-4">{String.fromCharCode(65 + idx)}.</span>
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={!selected}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Submit Answer
                </button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-xl border ${isCorrect ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
                        }`}
                >
                    <div className="flex items-start gap-4">
                        <span className="text-2xl">{isCorrect ? "🎉" : "❌"}</span>
                        <div>
                            <h3 className={`text-lg font-bold mb-2 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                                {isCorrect ? "Correct!" : "Incorrect"}
                            </h3>
                            <p className="text-gray-300 leading-relaxed">{challenge.explanation}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
