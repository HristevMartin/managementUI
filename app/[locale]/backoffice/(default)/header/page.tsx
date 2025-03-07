'use client';
import React from "react";
import Image from "next/image";
import logoImage from "./BigTravel-logo-black.png";

const Header: React.FC = ({ lang }: any) => {



  return (
    <div className="w-full bg-gray-100 text-white py-4 px-6 border-b border-gray-700 shadow-md mb-6">
      <div className="flex">
        <div className="w-1/2 p-1">
          <Image
            src={logoImage}
            alt="BigTravel"
            className="h-auto rounded-lg mt-4"
            width="150"
          />
        </div>

        <div className="flex w-1/2  p-1 text-black items-end justify-end">
          Welcome John!
  </div>
      </div>
    </div>
  );
};

export default Header;
