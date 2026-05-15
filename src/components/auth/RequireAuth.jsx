// src/components/auth/RequireAuth.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoadingState = () => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#777',
    }}
  >
    Cargando…
  </div>
);

const RequireAuth = ({ children, roles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default RequireAuth;
