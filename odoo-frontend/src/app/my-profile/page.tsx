'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MyProfile = () => {
  const router = useRouter();

  useEffect(() => {
    const redirectToProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user._id) {
            router.push(`/profile/${data.user._id}`);
          } else {
            router.push('/auth/login');
          }
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        router.push('/auth/login');
      }
    };

    redirectToProfile();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Redirecting to your profile...</h1>
      </div>
    </div>
  );
};

export default MyProfile;
