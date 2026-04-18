import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Onboarding() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        skill: "",
        goal: "",
        hours: "",
        style: "",
        backup_email: "",
        notifications_enabled: true,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post("/onboarding", {
                ...formData,
                hours: Number(formData.hours),
            });

            // 🔥 STORE FULL AGENT OUTPUT
            localStorage.setItem(
                "agentData",
                JSON.stringify(res.data.agents_output)
            );

            navigate("/roadmap");
        } catch (err) {
            alert("Backend error. Check console.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
            <form
                onSubmit={handleSubmit}
                className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl w-full max-w-md text-white"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Student Profiling
                </h2>

                <input
                    name="goal"
                    placeholder="Your Goal"
                    required
                    onChange={handleChange}
                    className="w-full mb-4 p-3 rounded bg-black/30"
                />

                <input
                    name="backup_email"
                    type="email"
                    placeholder="Backup Email (for notifications)"
                    onChange={handleChange}
                    className="w-full mb-4 p-3 rounded bg-black/30 border border-white/5 focus:border-indigo-500 outline-none"
                />

                <select
                    name="skill"
                    required
                    onChange={handleChange}
                    className="w-full mb-4 p-3 rounded bg-black/30"
                >
                    <option value="">Skill Level</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                </select>

                <input
                    type="number"
                    name="hours"
                    placeholder="Daily Study Hours"
                    required
                    onChange={handleChange}
                    className="w-full mb-4 p-3 rounded bg-black/30"
                />

                <select
                    name="style"
                    required
                    onChange={handleChange}
                    className="w-full mb-6 p-3 rounded bg-black/30"
                >
                    <option value="">Learning Style</option>
                    <option>Visual</option>
                    <option>Practical</option>
                    <option>Theory</option>
                </select>

                <button
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 rounded-xl font-semibold"
                >
                    {loading ? "Analyzing with AI..." : "Generate Roadmap 🤖"}
                </button>
            </form>
        </div>
    );
}
