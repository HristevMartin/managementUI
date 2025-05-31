"use client";

import ProductForm from "./_components/ProductForm";
import './_components/ProductForm.css';

const ProductOwner = () => {
  return (
    // <div style={{ width: '100%', border: '1px solid red' }}>
    //   <ProductForm />
    // </div>
    <div style={{ display: 'flex', width: '90vw', justifyContent: 'center' }}>
      <ProductForm />
    </div >
  );
};


export default ProductOwner;
