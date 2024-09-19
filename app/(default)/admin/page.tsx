'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import hasRequiredRole from '@/utils/checkRole';

const AdminPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (user) {
      if (hasRequiredRole(user.roles, 'Admin')) {
        setHasAccess(true);
      }
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasAccess) {
    return <div style={{color: 'red'}}>You do not have access to view this page.</div>;
  }

  return (
    <div>
      <h1>Admin Page</h1>
    </div>
  );
};

export default AdminPage;
