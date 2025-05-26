'use client';


import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, FolderPlus, Wrench, Plug } from 'lucide-react';
import { Button } from "@/components/ui/button";
import useAccessLogger from '@/hooks/useAccessLogger';
import { useSession } from 'next-auth/react';

const Index = ({ params }: { params: { locale: string } }) => {
  useAccessLogger('Management Dashboard');

  const { data: session } = useSession();
  console.log('show me the session', session);

  let userId = session?.user?.id;

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_TRAVEL_SECURITY}/travel/get-user/${userId}`);
      console.log('show me the response', response);
      if (response.ok) {
        const data = await response.json();
        console.log('show me in here this', data);
      }
    }

    if (userId) {
      fetchUser();
    }

  }, [userId]);


  useEffect(() => {
    const cards = document.querySelectorAll('.animate-fade-in-up');
    cards.forEach((card, index) => {
      const element = card as HTMLElement;
      element.style.animationDelay = `${index * 0.1}s`;
    });
  }, []);

  return (
    <div>
      <div className="max-w-1xl mx-auto text-left space-y-8 animate-fade-in-up">
        <Card className="mb-6 shadow-lg bg-gradient-to-r from-indigo-50 to-white">
          <CardHeader>
            <CardTitle className="text-3xl text-indigo-700 font-bold">
              Trader Pro Backoffice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-700 text-lg mb-2">
              Welcome to the administration portal for submitting trader profiles and their projects.
            </div>
            <div className="text-gray-500 text-base">
              Use this backoffice to add and manage <span className="font-semibold text-indigo-600">Trader Profiles</span> and submit <span className="font-semibold text-indigo-600">Project applications</span> for skilled trades such as mechanics, electricians, and more.
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg bg-white h-80 flex flex-col">
            <CardHeader className="flex-none p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                  <UserPlus className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900">Create Trader Profile</CardTitle>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Register a new trader in the system. Upload details, documents, and more.
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end p-6 pt-0">
              <div className="flex justify-center">
                <Button
                  asChild
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group/btn"
                >
                  <a
                    href={`/${params.locale}/backoffice/create-profile`}
                    className="flex items-center gap-3 text-sm tracking-wide"
                  >
                    <UserPlus className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                    Create Profile
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg bg-white h-80 flex flex-col">
            <CardHeader className="flex-none p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                  <FolderPlus className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900">Submit Project</CardTitle>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Add project applications for your traders.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-xs font-medium gap-1.5 border border-blue-200">
                  <Wrench size={12} />
                  Mechanic
                </span>
                <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-700 rounded-full text-xs font-medium gap-1.5 border border-amber-200">
                  <Plug size={12} />
                  Electrician
                </span>
                <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 rounded-full text-xs font-medium gap-1.5 border border-emerald-200">
                  🔧 Plumber
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end p-6 pt-0">
              <div className="flex justify-center">
                <Button
                  asChild
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group/btn"
                >
                  <a
                    href={`/${params.locale}/backoffice/create-project`}
                    className="flex items-center gap-3 text-sm tracking-wide"
                  >
                    <FolderPlus className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                    Submit Project
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

};

export default Index;