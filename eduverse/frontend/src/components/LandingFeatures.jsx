import { motion } from "framer-motion";

const FeatureBlock = ({ title, description, icon, align = "left", delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: align === "left" ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay }}
            className={`flex flex-col md:flex-row ${align === "right" ? "md:flex-row-reverse" : ""} items-center gap-10 my-24`}
        >
            {/* Visual Side */}
            <div className="flex-1 flex justify-center">
                <div className="relative w-64 h-64 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(129,140,248,0.2)]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl opacity-50 backdrop-blur-sm" />
                    <div className="relative z-10">
                        {icon}
                    </div>
                </div>
            </div>

            {/* Text Side */}
            <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-bold text-white mb-4">
                    {title}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};

export default function LandingFeatures() {
    return (
        <div className="max-w-7xl mx-auto px-6 pb-32">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-24 mt-32"
            >
                <h2 className="text-4xl font-bold text-white mb-6">Professional Intelligence</h2>
                <div className="w-24 h-1 bg-indigo-500 mx-auto rounded-full" />
            </motion.div>

            {/* Feature 1: Cognitive Profiling */}
            <FeatureBlock
                align="left"
                delay={0.2}
                title="Cognitive Profiling"
                description="Our AI doesn't just ask questions; it analyzes your responses to construct a deep cognitive profile. By understanding your learning speed, preferred style (visual/textual), and knowledge gaps, EduVerse creates a digital twin of your learning capability."
                icon={
                    <motion.svg viewBox="0 0 100 100" className="w-32 h-32 text-indigo-400">
                        <motion.circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                        <motion.path d="M25,50 L45,70 L75,30" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                        />
                    </motion.svg>
                }
            />

            {/* Feature 2: Dynamic Neural Curriculum */}
            <FeatureBlock
                align="right"
                delay={0.2}
                title="Dynamic Neural Curriculum"
                description="Static courses are obsolete. EduVerse generates a live, graph-based curriculum that adapts in real-time. If you master a concept quickly, the AI accelerates; if you struggle, it branches into remedial micro-lessons instantly."
                icon={
                    <motion.svg viewBox="0 0 100 100" className="w-32 h-32 text-purple-400">
                        <motion.circle cx="50" cy="50" r="10" fill="currentColor"
                            animate={{ r: [10, 15, 10] }} transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.circle cx="20" cy="20" r="5" fill="currentColor" />
                        <motion.circle cx="80" cy="20" r="5" fill="currentColor" />
                        <motion.circle cx="20" cy="80" r="5" fill="currentColor" />
                        <motion.circle cx="80" cy="80" r="5" fill="currentColor" />

                        <motion.path d="M50,50 L20,20 M50,50 L80,20 M50,50 L20,80 M50,50 L80,80" stroke="currentColor" strokeWidth="2"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                        />
                    </motion.svg>
                }
            />

            {/* Feature 3: Agentic Mentorship */}
            <FeatureBlock
                align="left"
                delay={0.2}
                title="Agentic Mentorship"
                description="You are never alone. Our multi-agent system provides specific roles: A 'Teacher' for explanations, a 'Critic' to challenge your understanding, and a 'Mentor' to keep you motivated. This triad ensures 360-degree coverage of your educational needs."
                icon={
                    <motion.svg viewBox="0 0 100 100" className="w-32 h-32 text-cyan-400">
                        <motion.rect x="30" y="30" width="40" height="40" rx="10" stroke="currentColor" strokeWidth="2" fill="none"
                            animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.circle cx="50" cy="50" r="10" fill="currentColor"
                            initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}
                        />
                    </motion.svg>
                }
            />
        </div>
    );
}
