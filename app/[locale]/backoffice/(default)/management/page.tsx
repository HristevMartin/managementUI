'use client';


import React, { useEffect } from 'react';
import StatCard from '@/components/StatCard';
import DashboardCard from '@/components/DashboardCard';
import LineChart from '@/components/LineChart';
import BarChart from '@/components/BarChart';
import PieChart from '@/components/PieChart';
import Table from '@/components/Table';

const Index = () => {
  // Animating entry of components
  useEffect(() => {
    const cards = document.querySelectorAll('.animate-fade-in-up');
    cards.forEach((card, index) => {
      const element = card as HTMLElement;
      element.style.animationDelay = `${index * 0.1}s`;
    });
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
       

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Sign ups in last 7 days"
            value={4567}
            className="delay-100"
          />
          <StatCard
            label="Revenue in last 7 days"
            value={7899}
            prefix="£"
            className="delay-200"
          />
          <StatCard
            label="Visitors in last 7 days"
            value={4567}
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
            contentClassName="h-[380px]"
            className="delay-500"
          >
            <LineChart />
          </DashboardCard>

          <DashboardCard
            title="Monthly Visitors by Source"
            contentClassName="h-[380px]"
            className="delay-600"
          >
            <BarChart />
          </DashboardCard>

          <DashboardCard
            title="Top Performing Support Agents"
            contentClassName="h-[380px]"
            className="delay-700"
          >
            <Table />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Index;