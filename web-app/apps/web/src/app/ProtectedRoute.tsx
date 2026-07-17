import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { Spinner } from '../components/ui/Misc';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
