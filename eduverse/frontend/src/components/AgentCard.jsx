import { motion } from 'framer-motion';

export default function AgentCard({ name, status, decision, confidence, onClick, actionLabel, enabled }) {
    const isError = status === 'ERROR';

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`
                relative overflow-hidden rounded-xl p-6 border transition-all duration-300 group
                ${isError
                    ? 'bg-red-900/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                    : 'bg-slate-900/40 backdrop-blur-md border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                }
            `}
        >
            {/* Holographic Scanline Effect */}
            {!isError && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 translate-y-[-100%] group-hover:translate-y-[100%] transition-all duration-1000 pointer-events-none" />
            )}

            <div className="flex justify-between items-start mb-4">
                <h3 className={`text-xl font-bold font-mono tracking-wide ${isError ? 'text-red-400' : 'text-cyan-300'}`}>
                    {name}
                </h3>
                <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${isError ? 'bg-red-500/10 border-red-500 text-red-500' :
                    status === 'COMPLETED' ? 'bg-green-500/10 border-green-500 text-green-400' :
                        status === 'WORKING' ? 'bg-amber-500/10 border-amber-500 text-amber-400' :
                            'bg-slate-700/50 border-slate-600 text-slate-400'
                    }`}>
                    {status}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Current Directive</p>
                    <p className="text-sm text-slate-300 font-mono leading-relaxed h-10 line-clamp-2">
                        {isError ? decision : decision || "Awaiting instructions..."}
                    </p>
                </div>

                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-semibold uppercase">Confidence Protocol</span>
                        <span className={isError ? 'text-red-400' : 'text-cyan-400'}>{confidence || '0%'}</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-sm h-4 relative overflow-hidden ring-1 ring-white/10">
                        {/* Ruler Marks Background */}
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(255,255,255,0.5) 5px)'
                            }}
                        />

                        {/* Progress Fill */}
                        <div
                            className={`h-full transition-all duration-1000 relative ${isError ? 'bg-red-500/80' : 'bg-cyan-500/80'}`}
                            style={{ width: confidence || '0%' }}
                        >
                            {/* Glitch/Scanline effect on bar */}
                            <div className="absolute inset-0 bg-white/20" style={{ transform: 'skewX(-45deg) translateX(-10px)' }}></div>
                        </div>
                    </div>
                </div>

                {onClick && (
                    <button
                        onClick={onClick}
                        disabled={!enabled}
                        className={`w-full py-2.5 rounded-lg border font-bold text-sm uppercase tracking-wider transition-all
                            ${!enabled
                                ? 'bg-slate-800/50 border-slate-700 text-slate-600 cursor-not-allowed'
                                : isError
                                    ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20'
                                    : 'bg-cyan-900/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95'
                            }
                        `}
                    >
                        {actionLabel || "Initiate Link"}
                    </button>
                )}
            </div>
        </motion.div>
    );
}
