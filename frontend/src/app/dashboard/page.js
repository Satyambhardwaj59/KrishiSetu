'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export default function DashboardRouter() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!user) return;

    console.log('[DashboardRouter] Role:', user.role);

    switch (user.role) {
      case 'farmer':
        router.push('/dashboard/farmer');
        break;
      case 'admin':
        router.push('/dashboard/admin');
        break;
      case 'buyer':
        router.push('/marketplace');
        break;
      default:
        // If role is missing or unknown, default to marketplace to avoid loops
        router.push('/marketplace');
    }
  }, [user, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin text-green-500 rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );
}
