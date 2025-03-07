'use client';

import type { Metadata } from "next";
import React, { Suspense } from "react";
import { Inter } from "next/font/google";
// import "../globals.css";
import "./globals.css";
import HeaderManagement from "@/components/Navbar/Navbar";
import { usePathname } from "next/navigation";
import Header from "./header/page";


const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: {
    locale: string;
  };
}>) {
  const lang = params.locale;

  const pathname: any = usePathname();
  const isAuthPage = pathname.includes(`/${lang}/backoffice/login`) || pathname.includes(`/${lang}/backoffice/register`) || pathname.includes(`/${lang}/backoffice/welcome-login`);

  const showSidebar = !isAuthPage;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div style={{ backgroundColor: "#ffffff" }} className="flex">
        {showSidebar && (
          <div className="min-h-screen">
            <HeaderManagement />
          </div>
        )}
        <main className="px-4 sm:px-10 lg:px-12 2xl:mx-auto 2xl:px-0">
          <div><Header /></div>
          {children}
        </main>
      </div>
    </Suspense>
  );
}


