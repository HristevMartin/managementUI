
import React from 'react';
import Image from "next/image";
import { Bell, Settings } from 'lucide-react';
import logoImage from "./BigTravel-logo-black.png";

const Header: React.FC = () => {
  return (
    <div className="flex items-center justify-between w-full h-16 px-4">
      {/* Big Travel Label */}
      {/* <div className="text-xl sm:text-2xl font-bold text-indigo-600">Big Travel</div> */}
      <div className="flex items-center justify-start w-full p-1">
        <Image
          src={logoImage}
          alt="BigTravel"
          className="h-auto rounded-lg"
          width="150"
        />
      </div>

      {/* Right side icons */}
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-indigo-500"></span>
        </button>
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
        </button>
        <div className="ml-3 relative">
          <div className="flex items-center">
            <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
              JD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
