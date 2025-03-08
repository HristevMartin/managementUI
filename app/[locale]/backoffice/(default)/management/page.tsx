// 'use client';
// import Linechart from './components/Linechart';
// import Barchart from './components/Barchart';
// import Piechart from './components/Piechart';
// import Scatterchart from './components/Scatterchart';
// import { useAuth } from '@/context/AuthContext';
// import { useSession } from 'next-auth/react';
// import { useTranslations } from 'next-intl';


// const sample = () => {
//   const { data: session } = useSession();
//   let userRoles = session?.user?.role;
//   let loggedUser = session?.user?.id ? true : false;

//   const t = useTranslations("Management");
//   const localeWord = t('title');

//   if (!loggedUser) {
//     return (
//       <div>
//         <h1>Not authorized</h1>
//       </div>
//     );
//   }

//   if (!userRoles.includes('USER')) {
//     return (
//       <div>
//         <h1>Not authorized</h1>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center">
//       <h1 style={{ textAlign: 'center' }} className="text-5xl mb-8">{localeWord}</h1>

//       <div className="pb-5 grid grid-cols-3 gap-4 w-full">
//         <div className="bg-white bg-white border border-gray-300 shadow-inner p-7 pt-1">
//           <h5 className="tracking-tight text-gray-900 text-sm row-span-3 items-center">Sign up in last 7 days</h5>
//           <p className="text-black row-span-4 text-5xl w-full text-center pt-4">4567</p>
//         </div>
//         <div className="bg-white bg-white border border-gray-300 shadow-inner p-7 pt-1">
//           <h5 className="tracking-tight text-gray-900 text-sm row-span-3 items-center">Revenue in last 7 days</h5>
//           <p className="text-black row-span-4 text-5xl w-full text-center pt-4">£7899</p>
//         </div>
//         <div className="bg-white bg-white border border-gray-300 shadow-inner p-7 pt-1">
//           <h5 className="tracking-tight text-gray-900 text-sm row-span-3 items-center">Visitors in last 7 days</h5>
//           <p className="text-black row-span-4 text-5xl w-full text-center pt-4">4567</p>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-[1400px]">
//         <Linechart />
//         <Barchart />
//         <Piechart />
//         <Scatterchart />
//       </div>
//     </div>

//   );
// };

// export default sample;

'use client';

import React, { useEffect } from 'react';
import StatCard from '@/components/StatCard';
import DashboardCard from '@/components/DashboardCard';
import LineChart from '@/components/LineChart';
import BarChart from '@/components/BarChart';
import PieChart from '@/components/PieChart';
import Table from '@/components/Table';
import { Plus } from 'lucide-react';

const Dashboard = () => {

  // Animating entry of components
  useEffect(() => {
    const cards = document.querySelectorAll('.animate-fade-in-up');
    cards.forEach((card, index) => {
      const element = card as HTMLElement;
      element.style.animationDelay = `${index * 0.1}s`;
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 animate-fade-in-down flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-gray-900">Sample Dashboard</h1>
          <button
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Sign ups in last 7 days"
            value={2130}
            className="delay-100"
          />
          <StatCard
            label="Revenue in last 7 days"
            value={4250}
            prefix="$"
            className="delay-200"
          />
          <StatCard
            label="Visitors in last 7 days"
            value={4210}
            className="delay-300"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          <DashboardCard
            title="Revenue By Source"
            contentClassName="h-[380px]"
            className="delay-400"
          >
            <PieChart />
          </DashboardCard>

          <DashboardCard
            title="Monthly Sign Ups"
            contentClassName="h-[340px]"
            className="delay-500"
          >
            <LineChart />
          </DashboardCard>

          <DashboardCard
            title="Monthly Visitors by Source"
            contentClassName="h-[300px]"
            className="delay-600"
          >
            <BarChart />
          </DashboardCard>

          <DashboardCard
            title="Top Performing Support Agents"
            contentClassName="h-[300px]"
            className="delay-700"
          >
            <Table />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;