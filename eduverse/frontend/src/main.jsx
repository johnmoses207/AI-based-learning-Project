import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";


import { GoogleOAuthProvider } from '@react-oauth/google';

// Diagnostic Logging
console.log("🚀 EduVerse: App Initialization Started...");

const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// We provide a dummy ID format if missing to prevent library initialization crashes
const clientId = rawClientId || "missing-id-check-vercel-env.apps.googleusercontent.com";

if (!rawClientId) {
  console.warn("⚠️ EduVerse: VITE_GOOGLE_CLIENT_ID is missing from environment variables.");
} else {
  console.log("✅ EduVerse: Google Client ID detected.");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
