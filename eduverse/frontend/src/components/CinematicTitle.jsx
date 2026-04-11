import { motion } from "framer-motion";

const CinematicTitle = ({ startAnimation = true }) => {

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    return (
        <motion.div
            className="relative mb-8 flex flex-col items-start z-10 p-0 text-left"
            initial="hidden"
            animate={startAnimation ? "visible" : "hidden"}
            variants={containerVariants}
        >
            {/* Subtle "Originals" Label */}
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                }}
                className="flex items-center gap-2 mb-4"
            >
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-indigo-400/80">
                    EduVerse Originals
                </span>
                <div className="h-[2px] w-6 bg-indigo-500/50" />
            </motion.div>

            {/* Main Title - Massive & Clean */}
            <div className="relative overflow-hidden">
                <motion.h1
                    variants={{
                        hidden: { y: "110%" },
                        visible: { y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="text-6xl md:text-8xl lg:text-9xl font-[900] tracking-tighter leading-[0.9] text-white"
                >
                    EDUVERSE
                </motion.h1>
            </div>

            <div className="relative overflow-hidden">
                <motion.h1
                    variants={{
                        hidden: { y: "110%" },
                        visible: { y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="text-6xl md:text-8xl lg:text-9xl font-[900] tracking-tighter leading-[0.9]"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400 bg-[length:200%_auto] animate-gradient">
                        AGENTS
                    </span>
                </motion.h1>
            </div>

            {/* Description - Streaming Style */}
            <motion.p
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { duration: 1 } }
                }}
                className="mt-6 text-lg md:text-2xl font-light text-gray-300 max-w-2xl leading-relaxed"
            >
                The Future of Learning is <span className="text-white font-medium">Autonomous</span>.
                Experience the first AI-driven education platform that thinks, plans, and teaches.
            </motion.p>
        </motion.div>
    );
};

export default CinematicTitle;
