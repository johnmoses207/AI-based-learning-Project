import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import api from "../services/api";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [streak, setStreak] = useState(0);
    const location = useLocation();

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                api.get(`/analytics/streak/${user.id}`)
                    .then(res => setStreak(res.data.streak))
                    .catch(err => console.error("Streak fetch error", err));
            } catch (e) {
                console.error(e);
            }
        }
    }, [location]);

    const links = [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/roadmap", label: "Roadmap" },
        { to: "/learn", label: "Learn" },
        { to: "/assessment", label: "Assessment" },
        { to: "/analytics", label: "Analytics" },
    ];

    // Hide Navbar on Intro ("/"), Auth ("/auth"), and Landing ("/home")
    if (location.pathname === "/" || location.pathname === "/auth" || location.pathname === "/home") return null;

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-black/10 backdrop-blur-md border-b border-white/10 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-white">

                {/* Logo */}
                <Link to="/home">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center space-x-3 cursor-pointer group"
                    >
                        <div className="shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
                            <Logo className="w-10 h-10" />
                        </div>
                        <div className="text-2xl font-bold tracking-tight">
                            <span className="text-white">Edu</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:from-indigo-300 group-hover:to-purple-300 transition-all duration-300">Verse</span>
                            <span className="text-xs uppercase tracking-widest ml-2 px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-gray-300 group-hover:border-white/40 transition-colors">AI</span>
                        </div>
                    </motion.div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isActive ? "text-yellow-400" : "text-gray-300 hover:text-white hover:bg-white/5"}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {link.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* Right Side: Streak Badge */}
                <div className="hidden md:flex items-center ml-6">
                    {streak > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-3 py-1.5 rounded-full border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                        >
                            <span className="text-lg animate-pulse">🔥</span>
                            <span className="text-orange-400 font-bold">{streak}</span>
                        </motion.div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden z-50">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-white focus:outline-none p-2 rounded-md hover:bg-white/10 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="md:hidden overflow-hidden bg-black/95 backdrop-blur-xl border-b border-white/10"
                    >
                        <div className="flex flex-col space-y-4 px-6 py-8">
                            {links.map((link, index) => (
                                <motion.div
                                    key={link.to}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <NavLink
                                        to={link.to}
                                        className={({ isActive }) =>
                                            `block text-lg font-medium transition-colors ${isActive ? "text-yellow-400" : "text-gray-300 hover:text-white"}`
                                        }
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.label}
                                    </NavLink>
                                </motion.div>
                            ))}
                            <div className="pt-4 mt-4 border-t border-white/10">
                                <Link to="/verify-certificate" className="block text-gray-400 hover:text-white transition-colors text-sm">Verify Certificate</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
