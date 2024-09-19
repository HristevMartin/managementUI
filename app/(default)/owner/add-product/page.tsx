'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import hasRequiredRole from '@/utils/checkRole';
import ProductForm from './_components/ProductForm';

const ProductOwner = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (user) {
      if (hasRequiredRole(user.role, 'ProductOwner')) {
        setHasAccess(true);
      }
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // if (!hasAccess) {
  //   return <div style={{color: 'red'}}>You do not have access to view this page.</div>;
  // }

  return (
    <div>
      <ProductForm />
    </div>
  );
};

export default ProductOwner;
