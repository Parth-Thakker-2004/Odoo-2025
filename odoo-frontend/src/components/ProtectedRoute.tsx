import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'admin';
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'user' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Wait until auth status is determined
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push('/auth/login');
      } else if (requiredRole === 'admin' && user?.role !== 'admin') {
        // Redirect to dashboard if admin role is required but user is not an admin
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, requiredRole, router, user?.role]);
  
  // Show nothing while loading or redirecting
  if (isLoading || !isAuthenticated || (requiredRole === 'admin' && user?.role !== 'admin')) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // Show the page content if authorized
  return <>{children}</>;
}
