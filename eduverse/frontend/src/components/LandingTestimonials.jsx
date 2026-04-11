import { motion } from "framer-motion";

const testimonials = [
    {
        name: "Alex Johnson",
        role: "Data Science Student",
        text: "The Curriculum Agent literally saved my semester. It built a roadmap that actually made sense for my skill level."
    },
    {
        name: "Sarah Chen",
        role: "Aspiring Developer",
        text: "I was stuck in tutorial hell for months. EduVerse's Profiling Agent pinpointed my weak spots instantly."
    },
    {
        name: "Marcus Williams",
        role: "Lifelong Learner",
        text: "The mentorship feels surprisingly human. It knows exactly when to push me and when to offer encouragement."
    }
];

export default function LandingTestimonials() {
    return (
        <div className="py-24 px-6 max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 text-white">
                Trusted by Future Leaders
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors"
                    >
                        <div className="text-indigo-400 text-4xl mb-4 font-serif">“</div>
                        <p className="text-gray-300 mb-6 leading-relaxed italic">
                            {t.text}
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
                                {t.name[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{t.name}</h4>
                                <span className="text-sm text-gray-500 uppercase tracking-wider">{t.role}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
