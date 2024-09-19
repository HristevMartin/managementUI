'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';

const AuthCheck = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {

    if (user && user.jwt) {
      router.push('/'); 
    } else {
      router.push('/register'); 
    }
  }, [user, router]);

  return null; 
};

export default AuthCheck;

