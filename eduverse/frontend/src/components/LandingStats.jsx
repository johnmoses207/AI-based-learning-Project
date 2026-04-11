import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const StatItem = ({ label, value, suffix = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div
            ref={ref}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            className="flex flex-col items-center"
        >
            <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-2">
                {value}{suffix}
            </div>
            <div className="text-indigo-200 uppercase tracking-widest text-sm font-semibold">
                {label}
            </div>
        </motion.div>
    );
};

export default function LandingStats() {
    return (
        <div className="w-full bg-black/20 backdrop-blur-sm border-t border-b border-white/5 py-12 mb-24">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                <StatItem label="Active Agents" value="500" suffix="+" />
                <StatItem label="Concepts Mastered" value="12" suffix="K" />
                <StatItem label="Learning Hours" value="850" suffix="+" />
                <StatItem label="Global Learners" value="2" suffix="K" />
            </div>
        </div>
    );
}
