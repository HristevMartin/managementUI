'use client';
import Linechart from './components/Linechart';
import Barchart from './components/Barchart';
import Piechart from './components/Piechart';
import Scatterchart from './components/Scatterchart';
import { useAuth } from '@/context/AuthContext';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';


const sample = () => {
  const { data: session } = useSession();
  let userRoles = session?.user?.role;
  let loggedUser = session?.user?.id ? true : false;

  const t = useTranslations("Management");
  const localeWord = t('title');

  if (!loggedUser) {
    return (
      <div>
        <h1>Not authorized</h1>
      </div>
    );
  }

  if (!userRoles.includes('USER')) {
    return (
      <div>
        <h1>Not authorized</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h1 style={{ textAlign: 'center' }} className="text-3xl mb-8">{localeWord}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-[1400px]">
        <Linechart />
        <Barchart />
        <Piechart />
        <Scatterchart />
      </div>
    </div>

  );
};

export default sample;
