// 'use client';

// import React, { createContext, useContext, ReactNode } from "react";
// import useLocalStorage from "@/hooks/useLocalStorageHook";
// import { useRouter } from 'next/navigation';
// import { logOutUser } from "@/services/userService";

// interface UserState {
//   access_token: string;
//   user_id: number;
//   role: string[],
//   customerId: number;
// }

// interface AuthContextType {
//   user: UserState;
//   login: (user: UserState) => void;
//   logout: () => void;
// }

// const initialUserState: UserState = {
//   access_token: "",
//   user_id: 0,
//   role: [],
//   customerId: 0
// };

// export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useLocalStorage<UserState>("user", initialUserState);
//   const router = useRouter();

//   const login = (user: UserState) => {
//     setUser(user);
//   };

//   const logout = async () => {
//     let accessToken = user.access_token;

//     try {
//       await logOutUser(accessToken);

//       setUser(initialUserState);
//       router.push('/login');

//     } catch (error) {
//       console.error('Logout failed', error);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within an AuthContextProvider");
//   return context;
// };

"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useHttpOnlyCookies } from "@/hooks/useLocalStorageHook";
import { useRouter } from "next/navigation";
import { logOutUser } from "@/services/userService";

const initialUserState = {
  access_token: "",
  user_id: 0,
  role: [],
  customerId: 0,
};

export const AuthContext = createContext(undefined);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useHttpOnlyCookies("user", initialUserState);
  const router = useRouter();

  const login = (user) => {
    setUser(user);
  };

  const logout = async () => {
    let accessToken = user.access_token;

    try {
      await logOutUser(accessToken);

      setUser(initialUserState);
      const isManagement = user.role.includes("management");

      router.push("/login");
     
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthContextProvider");
  return context;
};
