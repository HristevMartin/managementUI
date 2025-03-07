'use client';
import myImage from "./BigTravel-logo-black.png";

const Header: React.FC = ({ lang }: any) => {



  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }} className="w-full bg-gray-100 text-white py-4 px-6 border-b border-gray-700 shadow-md mb-6">
      <img
        src={myImage}
        alt="BigTravel"
        className="h-auto rounded-lg mt-4"
      />
    </div>
  );
};

export default Header;
