import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
    {
        question: "How is this different from ChatGPT?",
        answer: "EduVerse isn't just a chatbot. It's a system of specialized agents (Profiler, Planner, Mentor) that work together to track your long-term progress, unlike a single stateless conversation."
    },
    {
        question: "Is it really free?",
        answer: "Yes! We believe education should be accessible. The core agentic features are free to use during our public beta."
    },
    {
        question: "Can I use it for any subject?",
        answer: "Currently, we excel at Computer Science, AI, and Mathematics, but our agents are general-purpose learners capable of structuring paths for almost any text-based domain."
    },
    {
        question: "Do I get a certificate?",
        answer: "We focus on competence over certificates. However, your 'Knowledge Graph' serves as a verifiable proof of your mastery that you can share."
    }
];

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex justify-between items-center text-left focus:outline-none"
            >
                <span className="text-xl font-medium text-white">{question}</span>
                <span className={`text-2xl text-indigo-400 transition-transform ${isOpen ? "rotate-45" : ""}`}>
                    +
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-gray-400 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function LandingFAQ() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-24">
            <h2 className="text-4xl font-bold text-center mb-16 text-white">
                Frequently Asked Questions
            </h2>
            <div className="space-y-2">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} {...faq} />
                ))}
            </div>
        </div>
    );
}
