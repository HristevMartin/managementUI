"use client";

import ProductForm from "./_components/ProductForm";
import './_components/ProductForm.css';

const ProductOwner = () => {
  return (
    // <div className="flex justify-center ">
    <div style={{  display: 'flex', width: '90vw', justifyContent: 'center' }}>
      <ProductForm />
    </div >
  );
};


export default ProductOwner;
