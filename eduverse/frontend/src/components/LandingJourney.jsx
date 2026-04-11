import { motion } from "framer-motion";

const JourneyStep = ({ number, title, description, isLast = false, align = "left" }) => {
    return (
        <div className={`relative flex flex-col md:flex-row items-center gap-8 ${isLast ? "" : "mb-24"} ${align === "right" ? "md:flex-row-reverse" : ""}`}>

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, x: align === "left" ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className={`flex-1 w-full bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-xl hover:bg-white/10 transition-colors ${align === "right" ? "md:text-right" : "md:text-left"} text-center`}
            >
                <div className="text-indigo-400 text-sm font-bold tracking-widest uppercase mb-2">Step 0{number}</div>
                <h4 className="text-3xl font-bold text-white mb-4">{title}</h4>
                <p className="text-gray-300 leading-relaxed text-lg">
                    {description}
                </p>
            </motion.div>

            {/* Center Node (Desktop) */}
            <div className="hidden md:flex relative shrink-0 z-10 w-16 h-16 rounded-full bg-indigo-950 border-2 border-indigo-500 items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                <span className="text-indigo-400 font-bold text-xl">{number}</span>
                {/* Connector dots */}
                <div className="absolute inset-0 rounded-full animate-ping bg-indigo-500/20" />
            </div>

            {/* Empty Spacer for Balance */}
            <div className="flex-1 hidden md:block" />

            {/* Mobile Number Bubble (Absolute) */}
            <div className="md:hidden absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-indigo-600 border-4 border-black flex items-center justify-center font-bold z-20 shadow-lg">
                {number}
            </div>

        </div>
    );
};

export default function LandingJourney() {
    return (
        <div className="max-w-4xl mx-auto px-6 mb-32 relative">
            <h2 className="text-4xl font-bold text-center mb-24 text-white">Your Journey to Mastery</h2>

            {/* Center Line for Desktop */}
            <div className="absolute left-6 md:left-1/2 top-32 bottom-32 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-indigo-500 -translate-x-1/2 hidden md:block opacity-30" />

            <JourneyStep
                number="1"
                title="Tell Us About Yourself"
                description="Start by chatting with our Profiling Agent. We analyze your background, goals, and learning style to build your cognitive digital twin."
                align="left"
            />

            <JourneyStep
                number="2"
                title="Get Your Roadmap"
                description="Receive a fully personalized, AI-generated curriculum. It's not a generic list; it's a living graph of knowledge nodes tailored to you."
                align="right"
            />

            <JourneyStep
                number="3"
                title="Start Learning"
                description="Dive into interactive lessons. Our agents generated explanations, flashcards, and diagrams on the fly. No two lessons are ever the same."
                align="left"
            />

            <JourneyStep
                number="4"
                title="Track Evolution"
                description="Watch your skills grow in real-time. Our Analytics Dashboard visualizes your brain's expansion through complex topics."
                align="right"
                isLast={true}
            />

        </div>
    );
}
