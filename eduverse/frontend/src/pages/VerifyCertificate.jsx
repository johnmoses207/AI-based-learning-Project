import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import certificateService from '../services/certificates';
import Navbar from '../components/Navbar';

const VerifyCertificate = () => {
    const [certId, setCertId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await certificateService.verifyCertificate(certId);
            if (data.valid) {
                setResult(data);
            } else {
                setError(data.message || 'Invalid Certificate ID');
            }
        } catch (err) {
            setError('Error verifying certificate. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-900 selection:text-white overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
            </div>

            <Navbar />

            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
                >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6 text-center">
                        Verify Certificate
                    </h1>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">Certificate ID</label>
                            <input
                                type="text"
                                value={certId}
                                onChange={(e) => setCertId(e.target.value)}
                                placeholder="e.g. A1B2-C3D4"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono"
                                required
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : "Verify Now"}
                        </motion.button>
                    </form>

                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-8 pt-6 border-t border-white/10"
                            >
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center mb-4">
                                    <span className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Valid Certificate
                                    </span>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Student:</span>
                                        <span className="font-semibold">{result.student}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Course:</span>
                                        <span className="font-semibold text-blue-300">{result.course}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Issued On:</span>
                                        <span className="font-mono text-gray-300">{new Date(result.issue_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center text-red-400"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                </motion.div>
            </div>
        </div>
    );
};

export default VerifyCertificate;
