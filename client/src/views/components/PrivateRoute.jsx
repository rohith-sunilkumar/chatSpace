import { Navigate } from 'react-router-dom';
import { useAuth } from '../../controllers/context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
            </div>
        );
    }

    return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
