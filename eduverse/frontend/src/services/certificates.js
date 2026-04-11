// certificates.js
import api from './api';

const generateCertificate = async (token, courseName, score) => {
    // Note: In our current implementation, generation is handled by exam submission backend logic.
    // This frontend method might only be needed if we allow explicit re-generation.
    // We'll keep it but use the central API.
    try {
        const response = await api.post('/certificates/generate', { course_name: courseName, score });
        return response.data;
    } catch (error) {
        console.error("Certificate generation error", error);
        throw error;
    }
};

const getCertificate = async (uniqueId) => {
    try {
        const response = await api.get(`/certificates/${uniqueId}`);
        return response.data;
    } catch (error) {
        console.error("Get certificate error", error);
        throw error;
    }
}

const verifyCertificate = async (uniqueId) => {
    try {
        const response = await api.get(`/certificates/verify/${uniqueId}`);
        return response.data;
    } catch (error) {
        console.error("Certificate verification error", error);
        return { valid: false, message: "Verification failed or Server Error" };
    }
};

export default {
    generateCertificate,
    getCertificate,
    verifyCertificate
};
