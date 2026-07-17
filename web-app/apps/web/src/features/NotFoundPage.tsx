import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="font-mono text-6xl font-bold text-primary/20">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">The page you’re looking for doesn’t exist or has been moved.</p>
      <Button className="mt-6" onClick={() => navigate('/')}>Back to Dashboard</Button>
    </div>
  );
}
