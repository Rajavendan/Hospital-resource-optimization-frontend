import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their default page if they access unauthorized route
        if (user.role === 'doctor') return <Navigate to="/schedule" replace />;
        if (user.role === 'patient') return <Navigate to="/my-appointments" replace />;
        if (user.role === 'staff') return <Navigate to="/" replace />;
        if (user.role === 'ADMIN' || user.role === 'admin') return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
