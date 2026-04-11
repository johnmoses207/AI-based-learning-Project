import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function CodeChallenge({ challenge, onComplete }) {
    const [code, setCode] = useState(challenge.starter_code || "");
    const [output, setOutput] = useState(null);
    const [status, setStatus] = useState("idle"); // idle, running, success, fail
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [language, setLanguage] = useState("python");

    const handleRun = async () => {
        setStatus("running");
        setOutput("Running on server...");

        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const res = await api.post("/lab/run", {
                user_id: user?.id,
                topic: challenge.title,
                code: code,
                language: language,
                passed: false
            });

            const result = res.data;
            if (result.error) {
                setStatus("fail");
                setOutput(`Error:\n${result.error}`);
            } else {
                setStatus("success");
                setOutput(result.output || "No output returned.");
            }
        } catch (err) {
            setStatus("fail");
            setOutput("Execution failed: Server error");
            console.error(err);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        // 1. Run Code First (if not already verified or if changed)
        // For simplicity, we ALWAYS run code on submit to ensure freshness
        setStatus("running");
        let currentOutput = "";

        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const res = await api.post("/lab/run", {
                user_id: user?.id,
                topic: challenge.title,
                code: code,
                language: language,
                passed: false
            });

            if (res.data.error) {
                setStatus("fail");
                setOutput(`Error:\n${res.data.error}`);
                setIsSubmitting(false);
                return;
            }

            currentOutput = res.data.output || "";
            setOutput(currentOutput);
            setStatus("success");

            // 2. Verification Logic
            let passed = false;

            // Check if we have test cases
            if (challenge.test_cases && challenge.test_cases.length > 0) {
                // Simple Check: Does the output contain the expected output of the first test case?
                // This assumes the user's script prints the answer.
                const expected = challenge.test_cases[0].output;

                // Normalizing strings (trim whitespace, lowercase for softer check if needed)
                const normUser = currentOutput.trim();
                const normExpected = expected.trim();

                if (normUser === normExpected || normUser.includes(normExpected)) {
                    passed = true;
                } else {
                    alert(`❌ Incorrect Output.\n\nExpected: ${normExpected}\nGot: ${normUser}`);
                    setIsSubmitting(false);
                    return;
                }
            } else {
                // Fallback if no test cases: Trust the successful run
                passed = true;
            }

            if (passed) {
                if (onComplete) {
                    await onComplete(code);
                }
            }

        } catch (err) {
            console.error("Submit Error", err);
            setStatus("fail");
            alert("Execution failed during submission.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1e1e1e] border border-gray-700 rounded-xl overflow-hidden shadow-2xl mt-12"
        >
            {/* Header */}
            <div className="bg-[#252526] p-4 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                        <h3 className="font-bold text-gray-200">Coding Challenge</h3>
                        <p className="text-xs text-gray-400">{challenge.title}</p>
                    </div>
                </div>

                {/* Language Selector */}
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#333] text-gray-200 text-xs px-3 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-indigo-500"
                >
                    <option value="python">🐍 Python</option>
                    <option value="javascript">🟨 JavaScript</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 h-[500px]">
                {/* Left: Problem & Output */}
                <div className="border-r border-gray-700 flex flex-col">
                    <div className="p-6 flex-1 overflow-y-auto">
                        <h4 className="text-lg font-bold text-indigo-400 mb-2">Problem Statement</h4>
                        <p className="text-gray-300 mb-6 leading-relaxed text-sm">
                            {challenge.description}
                        </p>

                        {challenge.hint && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg mb-6">
                                <p className="text-yellow-500 text-xs font-bold uppercase mb-1">💡 Hint</p>
                                <p className="text-yellow-200 text-sm">{challenge.hint}</p>
                            </div>
                        )}
                    </div>

                    {/* Console Output */}
                    <div className="bg-black/50 p-4 h-1/3 border-t border-gray-700 font-mono text-xs overflow-y-auto">
                        <p className="text-gray-500 uppercase tracking-widest mb-2 text-[10px]">Console Output</p>
                        <pre className={
                            status === 'success' ? 'text-green-400' :
                                status === 'fail' ? 'text-red-400' :
                                    'text-gray-300'
                        }>{output || "Ready to run..."}</pre>
                    </div>
                </div>

                {/* Right: Code Editor */}
                <div className="flex flex-col bg-[#1e1e1e]">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-transparent text-gray-300 font-mono p-4 resize-none focus:outline-none text-sm leading-6"
                        spellCheck="false"
                    />

                    <div className="p-4 bg-[#252526] border-t border-gray-700 flex justify-end gap-3">
                        <button
                            onClick={() => setCode(challenge.starter_code)}
                            className="px-4 py-2 text-gray-400 hover:text-white text-xs font-bold transition-colors"
                        >
                            Reset Code
                        </button>
                        <button
                            onClick={handleRun}
                            disabled={status === 'running'}
                            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all
                                ${status === 'running' ? 'bg-gray-600 cursor-wait' : 'bg-gray-700 hover:bg-gray-600 text-white'}
                            `}
                        >
                            {status === 'running' ? 'Running...' : '▶ Run Code'}
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2 rounded-lg font-bold text-sm bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 transition-all flex items-center gap-2"
                        >
                            {isSubmitting ? 'Submitting...' : '✅ Submit Solution'}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
