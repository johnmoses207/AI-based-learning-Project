import Sidebar from './Sidebar';

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0f172a] to-[#0f172a]" />
                <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
            </div>

            <Sidebar />

            <main className="relative pl-64 z-10 transition-all duration-300">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
