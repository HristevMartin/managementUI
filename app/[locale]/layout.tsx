import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { JHipsterProvider } from "@/context/JHipsterContext";
import NextAuthProvider from "@/context/provider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ReactNode } from "react";
import { ModalProvider } from "@/context/useModal";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      template: `BigTravel Backoffice`,
      default: `Explore, Experience, Evolve`,
    },
  };
}


export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const messages = await getMessages();

  const lang = params.locale;

  return (
    <NextIntlClientProvider messages={messages}>
      <html title="sample" lang={lang}>
        {/* <head>
          <title>{metadata?.title}</title>
          <meta name="description" content={metadata.description} />
        </head> */}
        <ModalProvider>
          <NextAuthProvider>
            <JHipsterProvider>
              <SidebarProvider>
                <AuthContextProvider>
                  <body className={inter.className}>{children}</body>
                </AuthContextProvider>
              </SidebarProvider>
            </JHipsterProvider>
          </NextAuthProvider>
        </ModalProvider>
      </html>
    </NextIntlClientProvider>
  );
}
