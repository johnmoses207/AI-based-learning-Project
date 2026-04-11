import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RequireAuth from "./components/RequireAuth";

import Intro from "./pages/Intro";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Roadmap from "./pages/Roadmap";
import Learn from "./pages/Learn";
import Assessment from "./pages/Assessment";
import Analytics from "./pages/Analytics";
import Profiling from "./pages/Profiling";
import Achievements from "./pages/Achievements";
import Lab from "./pages/Lab";

import Admin from "./pages/Admin";

// ... (existing imports)
import MainLayout from "./components/Layout/MainLayout";

// ... (existing imports)

import VerifyCertificate from "./pages/VerifyCertificate";
import MyCertificates from "./pages/MyCertificates";

// ... (existing imports)

function App() {
  return (
    <BrowserRouter>
      {/* Navbar removed to use specific layouts */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/verify-certificate" element={<VerifyCertificate />} />

        {/* Protected Routes (Role: student) */}
        <Route element={<RequireAuth allowedRoles={["student", "admin"]} />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/roadmap" element={<MainLayout><Roadmap /></MainLayout>} />
          <Route path="/learn" element={<MainLayout><Learn /></MainLayout>} />
          <Route path="/assessment" element={<MainLayout><Assessment /></MainLayout>} />
          <Route path="/analytics" element={<MainLayout><Analytics /></MainLayout>} />
          <Route path="/profiling" element={<MainLayout><Profiling /></MainLayout>} />
          <Route path="/achievements" element={<MainLayout><Achievements /></MainLayout>} />
          <Route path="/lab" element={<MainLayout><Lab /></MainLayout>} />
          <Route path="/certificates" element={<MainLayout><MyCertificates /></MainLayout>} />
        </Route>

        {/* Admin Route (Hidden) */}
        <Route element={<RequireAuth allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
