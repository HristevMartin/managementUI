"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import hasRequiredRole from "@/utils/checkRole";
import ProductForm from "./_components/ProductForm";
import './_components/ProductForm.css';

const ProductOwner = () => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  let { user } = useAuth();

  console.log("user is ", user);

  useEffect(() => {
    if (user) {
      if (hasRequiredRole(user.role, "ProductOwner")) {
        setHasAccess(true);
      }
      setLoading(false);
    }
  }, [user]);

  // if (loading) {
  //   return (
  //     <div className="col-span-2 flex justify-center items-center mt-3">
  //       <div className="spinner w-[100px]"></div>
  //     </div>
  //   );
  // }

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
