import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/Logo";

const Intro = ({ onComplete }) => {
    const [phase, setPhase] = useState("singularity"); // singularity, explosion, formation, wormhole

    useEffect(() => {
        console.log("Intro mounted");
        // Phase 1: Singularity (0s - 2s)
        const t1 = setTimeout(() => { console.log("Phase: explosion"); setPhase("explosion"); }, 2000);

        // Phase 2: Explosion -> Formation (2s - 3.5s)
        const t2 = setTimeout(() => { console.log("Phase: formation"); setPhase("formation"); }, 3500);

        // Phase 3: Formation -> Wormhole (3.5s - 7s)
        const t3 = setTimeout(() => { console.log("Phase: wormhole"); setPhase("wormhole"); }, 7000);

        // Phase 4: Complete (8s)
        const t4 = setTimeout(() => {
            console.log("Intro complete");
            if (onComplete) onComplete();
        }, 8000);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }, []); // Run once on mount

    return (
        <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center perspective-[1000px]">
            <AnimatePresence mode="wait">
                {phase === "singularity" && (
                    <motion.div
                        key="singularity"
                        className="w-4 h-4 bg-white rounded-full shadow-[0_0_100px_rgba(255,255,255,0.8)]"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.5, 0.5, 3], opacity: [0, 1, 0.5, 1] }}
                        exit={{ scale: 50, opacity: 0, transition: { duration: 0.5 } }} // The Bang
                        transition={{ duration: 2, times: [0, 0.4, 0.7, 1] }}
                    />
                )}
            </AnimatePresence>

            {/* Ambient Stars (Persistent) */}
            <motion.div className="absolute inset-0 z-0">
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white rounded-full"
                        initial={{
                            x: "50vw",
                            y: "50vh",
                            scale: 0,
                            opacity: 0
                        }}
                        animate={phase !== "singularity" ? {
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            scale: Math.random() * 2,
                            opacity: [0, 1, 0.5]
                        } : {}}
                        transition={{ duration: 2, ease: "circOut", delay: Math.random() * 0.5 }}
                    />
                ))}
            </motion.div>

            <AnimatePresence>
                {(phase === "formation" || phase === "wormhole") && (
                    <motion.div
                        key="content"
                        className="relative z-10 flex flex-col items-center"
                        initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                        animate={phase === "wormhole" ?
                            { scale: 50, opacity: 0, filter: "blur(50px)" } : // Wormhole Effect
                            { opacity: 1, scale: 1, filter: "blur(0px)" } // Formation
                        }
                        transition={phase === "wormhole" ?
                            { duration: 1, ease: [0.7, 0, 0.84, 0] } :
                            { duration: 1.5, ease: "easeOut" }
                        }
                    >
                        {/* Animated Unified Brand Logo */}
                        <div className="relative mb-6">
                            <motion.div
                                animate={{
                                    filter: ["drop-shadow(0 0 0px rgba(99,102,241,0))", "drop-shadow(0 0 30px rgba(99,102,241,0.6))", "drop-shadow(0 0 0px rgba(99,102,241,0))"]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Logo className="w-32 h-32 md:w-48 md:h-48 text-white" />
                            </motion.div>
                        </div>

                        {/* Text Reveal */}
                        <h1 className="text-5xl md:text-7xl font-[900] text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200 tracking-tighter">
                            EDUVERSE
                        </h1>
                        <p className="text-indigo-400 tracking-[0.5em] text-sm uppercase mt-4">
                            Expanding Knowledge
                        </p>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* Flashbang Overlay for Transition */}
            <AnimatePresence>
                {phase === "explosion" && (
                    <motion.div
                        key="flash"
                        className="absolute inset-0 bg-white z-50"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                )}
            </AnimatePresence>


        </div>
    );
};

export default Intro;
