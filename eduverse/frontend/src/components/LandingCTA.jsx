import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingCTA() {
    const navigate = useNavigate();

    return (
        <div className="w-full bg-indigo-950/30 border-t border-white/5 py-24 px-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl mx-auto"
            >
                <h2 className="text-5xl font-bold mb-8">Ready to evolve?</h2>
                <p className="text-xl text-gray-300 mb-10">
                    Join thousands of learners who have already transcended traditional education.
                    Your personal AI team is waiting.
                </p>
                <button
                    onClick={() => navigate("/auth")}
                    className="px-10 py-5 bg-white text-indigo-900 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                    Start Free Trial
                </button>
            </motion.div>

            <div className="mt-32 pt-8 border-t border-white/5 text-gray-500 text-sm flex justify-between max-w-7xl mx-auto">
                <div>© 2025 EduVerse AI. All rights reservd.</div>
                <div className="space-x-4">
                    <a href="#" className="hover:text-white">Privacy</a>
                    <a href="#" className="hover:text-white">Terms</a>
                    <a href="#" className="hover:text-white">Contact</a>
                </div>
            </div>
        </div>
    );
}
