import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, Bot, User, Loader } from 'lucide-react';

export default function AgentChatModal({ isOpen, onClose, agentName, userId, onComplete }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (isOpen && userId && agentName) {
            fetchHistory();
        }
    }, [isOpen, userId, agentName]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/agents/status/${userId}/${agentName}`);
            // Transform history to local format if needed or use as is
            // Backend returns: [{'role': 'user', 'content': '...'}, ...]
            if (res.data.history) {
                setMessages(res.data.history);
            }
            if (res.data.status === "COMPLETED") {
                // Determine if we should show a completion message or data
                onComplete && onComplete(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post(`http://localhost:8000/api/agents/chat`, {
                user_id: userId,
                agent_name: agentName,
                message: userMsg.content
            });

            const botMsg = { role: 'assistant', content: res.data.response };
            setMessages(prev => [...prev, botMsg]);

            if (res.data.status === "COMPLETED") {
                onComplete && onComplete(res.data.data);
            }

        } catch (err) {
            console.error("Chat error", err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error: Could not reach agent." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-purple-500/30 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl shadow-purple-500/20">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gray-800/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Bot className="text-purple-400" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">{agentName}</h3>
                            <p className="text-xs text-gray-400">Powered by Gemini</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 mt-20">
                            <Bot size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Start a conversation to begin...</p>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                                    ? 'bg-purple-600 text-white rounded-tr-none'
                                    : 'bg-gray-800 text-gray-200 rounded-tl-none border border-white/5'
                                }`}>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{typeof msg.content === 'object' ? JSON.stringify(msg.content) : msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-800 rounded-2xl p-4 rounded-tl-none border border-white/5 flex items-center gap-2">
                                <Loader size={16} className="animate-spin text-purple-400" />
                                <span className="text-xs text-gray-400">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-gray-800/30 rounded-b-2xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your message..."
                            className="flex-1 bg-gray-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition placeholder:text-gray-600"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
