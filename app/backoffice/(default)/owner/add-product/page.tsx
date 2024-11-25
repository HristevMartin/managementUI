"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import hasRequiredRole from "@/utils/checkRole";
import ProductForm from "./_components/ProductForm";
import './_components/ProductForm.css';

const ProductOwner = () => {
  return (
    <div>
      <ProductForm />
    </div>
  );
};


export default ProductOwner;
