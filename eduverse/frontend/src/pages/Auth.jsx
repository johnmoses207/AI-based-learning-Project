import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

// Shared Robot Component
const RobotCharacter = () => (
    <motion.svg
        width="220"
        height="220"
        viewBox="0 0 200 200"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" }}
    >
        <circle cx="100" cy="100" r="80" fill="rgba(99, 102, 241, 0.2)" filter="blur(20px)" />
        <motion.rect x="60" y="80" width="80" height="70" rx="15" fill="#4F46E5" />
        <rect x="70" y="90" width="60" height="50" rx="10" fill="#1E1B4B" />
        <motion.circle cx="85" cy="115" r="5" fill="#00E5FF" animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, delay: 3, duration: 0.2 }} />
        <motion.circle cx="115" cy="115" r="5" fill="#00E5FF" animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, delay: 3, duration: 0.2 }} />
        <path d="M90 130 Q100 135 110 130" stroke="#00E5FF" strokeWidth="2" fill="none" />
        <path d="M60 80 Q100 60 140 80" fill="#4338CA" />
        <motion.rect x="95" y="40" width="10" height="30" rx="2" fill="#6366F1" animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }} />
        <circle cx="100" cy="35" r="5" fill="#F472B6" />
        <path d="M60 100 Q40 120 40 140" stroke="#4F46E5" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M140 100 Q160 120 160 140" stroke="#4F46E5" strokeWidth="8" strokeLinecap="round" fill="none" />
    </motion.svg>
);

// Shared Form Component
const AuthForm = ({ mode, email, setEmail, password, setPassword, error, message, loading, handleAuth }) => (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 h-full text-white">
        <h2 className="text-3xl font-bold mb-6">{mode === "login" ? "Welcome Back" : "Join EduVerse"}</h2>
        <div className="space-y-4 w-full max-w-xs">
            <div className="group">
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    disabled={loading}
                />
            </div>
            <div className="group">
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    disabled={loading}
                />
            </div>
            
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 p-3 rounded-lg flex items-center gap-2"
                    >
                        <span className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                        {error}
                    </motion.div>
                )}
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-emerald-400 text-xs bg-emerald-400/10 border border-emerald-400/20 p-3 rounded-lg flex items-center gap-2"
                    >
                        <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => handleAuth(mode === "login")}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    loading ? "bg-indigo-600/50 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/20"
                }`}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                    </>
                ) : (
                    mode === "login" ? "Sign In" : "Explore EduVerse"
                )}
            </button>
        </div>
    </div>
);

export default function Auth() {
    console.log("📂 EduVerse: Auth Page Initializing...");
    
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        if (!email || !password) {
            setError("All fields are required");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address");
            return false;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return false;
        }
        return true;
    };

    const handleAuth = async (isLoginRequest) => {
        setError("");
        setMessage("");
        
        if (!validateForm()) return;

        setLoading(true);
        const endpoint = isLoginRequest ? "/auth/login" : "/auth/register";
        
        try {
            const res = await api.post(endpoint, { email, password });
            
            if (isLoginRequest) {
                authLogin(res.data.user, res.data.access_token);
                navigate("/dashboard");
            } else {
                setMessage("Welcome! Your account is ready. Please sign in.");
                setIsLogin(true);
                setPassword(""); // Clear password for security
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error("Auth Exception:", err);
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail[0].msg || "Validation error");
            } else if (typeof detail === 'string') {
                setError(detail);
            } else {
                setError("Connection failed. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    const commonProps = { email, setEmail, password, setPassword, error, message, loading, handleAuth };

    return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 selection:bg-indigo-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            {/* Main Card Container */}
            <div className="relative w-full max-w-4xl h-[640px] bg-white/[0.02] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-2xl">

                {/* REGISTER FORM */}
                <div className="absolute top-0 left-0 w-1/2 h-full z-10 hidden md:block">
                    <AuthForm mode="register" {...commonProps} />
                </div>

                {/* LOGIN FORM */}
                <div className="absolute top-0 right-0 w-1/2 h-full z-10 hidden md:block">
                    <AuthForm mode="login" {...commonProps} />
                </div>

                {/* MOBILE VIEW */}
                <div className="md:hidden w-full h-full flex flex-col items-center justify-center p-6">
                    <AuthForm mode={isLogin ? "login" : "register"} {...commonProps} />
                    <button 
                        onClick={() => setIsLogin(!isLogin)} 
                        className="text-indigo-400 mt-6 text-sm font-medium hover:text-indigo-300 transition-colors"
                        disabled={loading}
                    >
                        {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
                    </button>
                </div>

                {/* SLIDING OVERLAY (Desktop) */}
                <motion.div
                    initial={false}
                    animate={{ x: isLogin ? "0%" : "100%" }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    className="absolute top-0 left-0 w-1/2 h-full z-20 hidden md:flex flex-col items-center justify-center p-12 text-center"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-900 shadow-inner" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? "login-overlay" : "register-overlay"}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center"
                            >
                                <RobotCharacter />

                                <h2 className="text-4xl font-bold text-white mt-8 mb-3">
                                    {isLogin ? "Hello, Explorer!" : "Welcome Home"}
                                </h2>
                                <p className="text-indigo-100/80 mb-10 max-w-xs leading-relaxed">
                                    {isLogin
                                        ? "Sign up to begin your personalized AI-driven learning adventure."
                                        : "Reconnect with your mentor and pick up right where you left off."}
                                </p>

                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError("");
                                        setMessage("");
                                    }}
                                    disabled={loading}
                                    className="px-10 py-3.5 border-2 border-white/30 text-white rounded-2xl font-bold hover:bg-white hover:text-indigo-900 hover:border-white transition-all transform active:scale-95"
                                >
                                    {isLogin ? "Get Started" : "Sign In"}
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
