import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";



import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId) {
  console.warn("⚠️ VITE_GOOGLE_CLIENT_ID is missing! Google Login will be disabled.");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {clientId ? (
      <GoogleOAuthProvider clientId={clientId}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>
);
