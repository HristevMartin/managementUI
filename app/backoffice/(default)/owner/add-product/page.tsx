"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import hasRequiredRole from "@/utils/checkRole";
import ProductForm from "./_components/ProductForm";
import './_components/ProductForm.css';

const ProductOwner = () => {
  // let { user } = useAuth();

  // console.log("user is ", user);

  // useEffect(() => {
  //   if (user) {
  //     if (hasRequiredRole(user?.role, "PRODUCTOWNER")) {
  //     }
  //   }
  // }, [user]);

  return (
    <div>
      <ProductForm />
    </div>
  );
};


export default ProductOwner;
