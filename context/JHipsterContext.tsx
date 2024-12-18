'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
  jHipsterAuthToken: string | null;
}

interface JHipsterProviderProps {
  children: ReactNode;
}

const SidebarContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthJHipster = (): AuthContextType => {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error('useAuthJHipster must be used within a JHipsterProvider');
  }

  return context;
}

export const JHipsterProvider = ({ children }: JHipsterProviderProps) => {
  const [jHipsterAuthToken, setJHipsterAuth] = useState(null);

  const apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;

  useEffect(() => {
    const makeRequest = async () => {
      try {
        const response = await fetch(`${apiUrlSpring}/api/authenticate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'admin',
            password: 'admin',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setJHipsterAuth(data.id_token);
        } else {
          console.error('Request failed: ', response.status);
        }
      } catch (error) {
        console.error('Request failed with error: ', error);
      }
    };

    makeRequest();
  }, []);

  return (
    <SidebarContext.Provider value={{ jHipsterAuthToken }}>
      {children}
    </SidebarContext.Provider>
  );
};
