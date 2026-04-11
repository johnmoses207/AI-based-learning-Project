import { Navigate, Outlet, useLocation } from "react-router-dom";

const RequireAuth = ({ allowedRoles }) => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const location = useLocation();

    let userRole = "student"; // Default
    try {
        if (userStr) {
            const user = JSON.parse(userStr);
            userRole = user.role || "student";
        }
    } catch (e) {
        console.error("Error parsing user from local storage", e);
    }

    if (!token) {
        // Not logged in -> Redirect to Auth, save location
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Logged in but wrong role -> Authorization Error or Dashboard
        // For now, redirect to Dashboard if trying to access Admin
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default RequireAuth;
