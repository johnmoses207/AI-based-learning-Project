export default function Timeline({ week, title, topics, status }) {
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-indigo-300">
                    Week {week}: {title}
                </h3>
                <span
                    className={`text-sm px-3 py-1 rounded-full ${status === "Completed"
                            ? "bg-green-600"
                            : status === "In Progress"
                                ? "bg-yellow-500"
                                : "bg-gray-600"
                        }`}
                >
                    {status}
                </span>
            </div>

            <ul className="mt-4 space-y-2 text-gray-200 text-sm">
                {topics.map((topic, index) => (
                    <li key={index}>• {topic}</li>
                ))}
            </ul>
        </div>
    );
}
