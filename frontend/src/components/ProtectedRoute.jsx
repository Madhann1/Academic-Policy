import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full loading-spinner" />
                    <p className="text-slate-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Faculty with firstLogin must change password first
    if (user.firstLogin && location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const defaultRoutes = {
            admin: '/admin/dashboard',
            hod: '/hod/dashboard',
            faculty: '/faculty/dashboard',
            student: '/student/dashboard',
        };
        return <Navigate to={defaultRoutes[user.role] || '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;
