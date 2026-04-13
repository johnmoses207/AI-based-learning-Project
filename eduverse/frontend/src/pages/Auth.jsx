import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useGoogleLogin } from '@react-oauth/google';

// Google Icon SVG
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
        <path d="M12 4.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

// Reuse Robot Component (same as before)
const RobotCharacter = () => (
    <motion.svg
        width="250"
        height="250"
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

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true); // Default True = Login Mode (Overlay on Left)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleAuth = async (isLoginRequest) => {
        setError("");
        const endpoint = isLoginRequest ? "/auth/login" : "/auth/register";
        try {
            const res = await api.post(endpoint, { email, password });
            if (isLoginRequest) {
                localStorage.setItem("token", res.data.access_token);
                if (res.data.user) {
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                }
                navigate("/dashboard");
            } else {
                setError("Account created! Please Sign In.");
                setIsLogin(true); // Switch to login view
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Authentication Failed");
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await api.post("/auth/google", {
                    token: tokenResponse.access_token,
                });
                localStorage.setItem("token", res.data.access_token);
                if (res.data.user) {
                    // Store user info if needed
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                }
                navigate("/dashboard");
            } catch (err) {
                console.error("Google Login Error:", err);
                setError("Google Login Failed");
            }
        },
        onError: () => setError("Google Login Failed"),
    });

    // Shared Form Component
    const AuthForm = ({ mode }) => (
        <div className="flex flex-col items-center justify-center p-12 h-full text-white">
            <h2 className="text-3xl font-bold mb-6">{mode === "login" ? "Sign In" : "Create Account"}</h2>
            <div className="space-y-4 w-full max-w-xs">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-indigo-500 outline-none"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-indigo-500 outline-none"
                />
                {error && <div className="text-red-400 text-sm">{error}</div>}
                <button
                    onClick={() => handleAuth(mode === "login")}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-bold shadow-lg transition-transform active:scale-95"
                >
                    {mode === "login" ? "Login" : "Register"}
                </button>

                {/* Social Login - Only show if Google Client ID is configured */}
                {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                    <>
                        <div className="relative flex items-center justify-center my-4">
                            <div className="border-t border-white/10 w-full absolute"></div>
                            <span className="bg-black px-2 text-xs text-gray-500 relative z-10 uppercase">Or continue with</span>
                        </div>

                        <button
                            onClick={() => handleGoogleLogin()}
                            className="w-full bg-white text-gray-900 border border-white/10 py-3 rounded-lg font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3 hover:bg-gray-100 cursor-pointer"
                        >
                            <GoogleIcon />
                            <span>Google</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            {/* Main Card Container */}
            <div className="relative w-full max-w-4xl h-[600px] bg-black/50 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">

                {/* REGISTER FORM (Sits on Left) */}
                <div className="absolute top-0 left-0 w-1/2 h-full z-10 hidden md:block">
                    <AuthForm mode="register" />
                </div>

                {/* LOGIN FORM (Sits on Right) */}
                <div className="absolute top-0 right-0 w-1/2 h-full z-10 hidden md:block">
                    <AuthForm mode="login" />
                </div>

                {/* MOBILE VIEW (Stacked) */}
                <div className="md:hidden w-full h-full flex flex-col items-center justify-center">
                    <AuthForm mode={isLogin ? "login" : "register"} />
                    <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-400 mt-4 underline">
                        {isLogin ? "Need an account?" : "Have an account?"}
                    </button>
                </div>


                {/* SLIDING OVERLAY (Desktop Only) */}
                {/* If isLogin is TRUE: Overlay is on LEFT (covering Register). User sees Login on Right. */}
                {/* If isLogin is FALSE: Overlay is on RIGHT (covering Login). User sees Register on Left. */}

                <motion.div
                    initial={false}
                    animate={{ x: isLogin ? "0%" : "100%" }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute top-0 left-0 w-1/2 h-full bg-indigo-900 z-20 hidden md:flex flex-col items-center justify-center p-12 text-center"
                >
                    {/* Background FX inside Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-purple-900 opacity-90" />
                    <div className="relative z-10 flex flex-col items-center">

                        {/* Content changes based on position for context */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? "login-overlay" : "register-overlay"}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center"
                            >
                                <RobotCharacter />

                                <h2 className="text-3xl font-bold text-white mt-6 mb-2">
                                    {isLogin ? "New to EduVerse?" : "Welcome Back!"}
                                </h2>
                                <p className="text-indigo-200 mb-8 max-w-xs">
                                    {isLogin
                                        ? "Start your journey today. Create an account to meet your AI mentor."
                                        : "Resume your progress. Your personalized roadmap awaits."}
                                </p>

                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="px-8 py-3 border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-indigo-900 transition-colors"
                                >
                                    {isLogin ? "Sign Up" : "Sign In"}
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
