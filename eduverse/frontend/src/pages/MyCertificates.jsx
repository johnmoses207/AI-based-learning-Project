import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

const MyCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) return;

            try {
                const res = await api.get(`/certificates/user/${user.id}`);
                setCertificates(res.data);
            } catch (err) {
                console.error("Failed to fetch certificates", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificates();
    }, []);

    const handleDownload = (downloadUrl) => {
        // Construct full URL if needed or use relative
        window.open(`http://localhost:8000${downloadUrl}`, '_blank');
    };

    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-8">
                My Certificates
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                    <motion.div
                        key={cert.id}
                        whileHover={{ y: -5 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>
                        </div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl mb-4 flex items-center justify-center text-black font-bold text-xl">
                                🎓
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{cert.course_name}</h3>
                            <p className="text-gray-400 text-sm mb-4">Issued on {new Date(cert.issue_date).toLocaleDateString()}</p>

                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full text-blue-300">
                                    Score: {cert.score}
                                </span>
                            </div>

                            <button
                                onClick={() => handleDownload(cert.download_url)}
                                className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                Download PDF
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            </button>
                        </div>
                    </motion.div>
                ))}

                {/* Placeholder for locked certificates */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-50 dashed-border">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                        🔒
                    </div>
                    <h3 className="text-lg font-bold text-gray-400">More Coming Soon</h3>
                    <p className="text-xs text-gray-500 mt-2">Complete more courses to earn certificates</p>
                </div>
            </div>


        </div>
    );
};

export default MyCertificates;
