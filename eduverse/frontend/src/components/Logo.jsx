import { motion } from "framer-motion";

export default function Logo({ className = "w-10 h-10" }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible"
            >
                <defs>
                    <linearGradient id="core-gradient" x1="0" y1="0" x2="100" y2="100">
                        <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
                        <stop offset="100%" stopColor="#a855f7" /> {/* Purple */}
                    </linearGradient>
                    <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Outer Rotating Ring (Clockwise) */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="url(#core-gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="20 20"
                    strokeOpacity="0.5"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{ originX: "50px", originY: "50px" }}
                />

                {/* Inner Rotating Ring (Counter-Clockwise) */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray="50 40"
                    strokeOpacity="0.3"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    style={{ originX: "50px", originY: "50px" }}
                />

                {/* Central Pulsing Core (Hexagon-ish) */}
                <motion.path
                    d="M50 20L76 35V65L50 80L24 65V35L50 20Z"
                    fill="url(#core-gradient)"
                    fillOpacity="0.8"
                    stroke="#fff"
                    strokeWidth="1"
                    filter="url(#glow-filter)"
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ originX: "50px", originY: "50px" }}
                />

                {/* Orbiting Agent Dot 1 */}
                <motion.g animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} style={{ originX: "50px", originY: "50px" }}>
                    <circle cx="50" cy="15" r="4" fill="#22d3ee" filter="url(#glow-filter)" />
                </motion.g>

                {/* Orbiting Agent Dot 2 */}
                <motion.g animate={{ rotate: -360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} style={{ originX: "50px", originY: "50px" }}>
                    <circle cx="50" cy="85" r="3" fill="#fbbf24" filter="url(#glow-filter)" />
                </motion.g>

            </svg>
        </div>
    );
}
