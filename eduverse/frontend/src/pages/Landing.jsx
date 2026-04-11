import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Intro from "./Intro";
import LandingFeatures from "../components/LandingFeatures";
import LandingStats from "../components/LandingStats";
import LandingJourney from "../components/LandingJourney";
import LandingCTA from "../components/LandingCTA";
import LandingTestimonials from "../components/LandingTestimonials";
import LandingFAQ from "../components/LandingFAQ";
import Logo from "../components/Logo";
import CinematicTitle from "../components/CinematicTitle";

export default function Landing() {
    const navigate = useNavigate();
    const [showIntro, setShowIntro] = useState(() => {
        // Only show intro if it hasn't been seen in this session
        const hasSeenIntro = sessionStorage.getItem('eduverse_intro_seen');
        return !hasSeenIntro;
    });

    const handleIntroComplete = () => {
        sessionStorage.setItem('eduverse_intro_seen', 'true');
        setShowIntro(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden font-sans">
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        className="fixed inset-0 z-[100]"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Intro onComplete={handleIntroComplete} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- PREMIUM DARK HERO SECTION --- */}
            <div className="relative w-full h-screen flex flex-col items-center justify-center px-6 md:px-20 overflow-hidden">

                {/* 1. Dynamic Aurora Background (Dark Mode) */}
                <div className="absolute inset-0 z-0 bg-[#050505]">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />

                    {/* Deep Cosmic Glows */}
                    <motion.div
                        className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-indigo-900/20 blur-[100px] rounded-full mix-blend-screen"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 blur-[80px] rounded-full mix-blend-screen"
                        animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                {/* 2. Navigation (Transparent Premium Header) */}
                <nav className="absolute top-0 left-0 w-full p-6 md:p-8 flex justify-between items-center z-50">
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        {/* Brand Logo - Minimalist */}
                        <div className="bg-white/10 p-2 rounded-lg border border-white/10 backdrop-blur-sm">
                            <Logo className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            EduVerse
                        </span>
                    </div>
                    <div className="hidden md:flex gap-8 text-sm font-semibold text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#journey" className="hover:text-white transition-colors">Journey</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </div>
                </nav>

                {/* 3. Hero Content - Split Layout */}
                <div className="relative z-30 w-full max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mt-0">

                    {/* Left Column: Text Content */}
                    <div className="text-left flex flex-col items-start justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={!showIntro ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-indigo-300 mb-8 hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-sm"
                        >
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            v2.0 Now Live: Agentic Intelligence
                        </motion.div>

                        <CinematicTitle startAnimation={!showIntro} />

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={!showIntro ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="flex flex-wrap gap-4 mt-10"
                        >
                            <button
                                onClick={() => navigate("/auth")}
                                className="group flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full hover:bg-gray-100 transition-all font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] text-lg"
                            >
                                Start Learning Free
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                            <button
                                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                                className="flex items-center gap-2 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full hover:bg-white/10 transition-all font-bold backdrop-blur-sm text-lg"
                            >
                                View Methodology
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Column: Dashboard Preview Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 100, rotateY: -10 }}
                        animate={!showIntro ? { opacity: 1, x: 0, rotateY: 0 } : {}}
                        transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group perspective-[1000px]">
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay z-10 pointer-events-none" />

                            <img
                                src="/assets/dashboard-preview.png"
                                alt="EduVerse Dashboard Preview"
                                className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700 ease-out"
                            />

                            {/* Reflection/Shine Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />
                        </div>


                    </motion.div>

                </div>

                {/* Hero Graphic / Dashboard Preview (Dark Glass) */}

            </div>

            {/* --- REST OF THE CONTENT (Dark Mode Base) --- */}
            <div className="relative z-10 bg-[#050505] pt-32">

                <div id="features">
                    <LandingFeatures />
                </div>

                <LandingStats />

                <div id="journey">
                    <LandingJourney />
                </div>

                <LandingTestimonials />
                <LandingFAQ />
                <LandingCTA />
            </div>

        </div>
    );
}
