'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const SidebarContext = createContext();

export const useAuthJHipster = () => useContext(SidebarContext);

export const JHipsterProvider = ({ children }) => {
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
