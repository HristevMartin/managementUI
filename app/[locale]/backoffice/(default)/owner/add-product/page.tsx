"use client";

import ProductForm from "./_components/ProductForm";
import './_components/ProductForm.css';

const ProductOwner = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', width: '100vw', justifyContent: 'center' }}>
      <ProductForm />
    </div>
  );
};


export default ProductOwner;
