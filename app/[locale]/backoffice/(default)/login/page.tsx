// 'use client';

// import React, { useState } from 'react';
// import './login.css';
// import { loginUser } from '@/services/userService';
// import { signIn, useSession } from 'next-auth/react';
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from "next/navigation";
// import { auth } from '@/auth';

// const Login: React.FC = ({ lang }: any) => {
//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [error, setError] = useState<string>('');
//   const router = useRouter();

//   const { data: session } = useSession();
//   const userId = session?.user?.id;

//   if (userId) {
//     router.push(`/${lang}/backoffice/management`);
//   }

//   const handleLogin = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
//     event.preventDefault();
//     const loginData = { email: email, password: password };

//     try {
//       const result = await loginUser(loginData);

//       if (result.success) {
//         let payload = {
//           id: result.message.id,
//           role: result.message.roles,
//           callbackUrl: `${lang}/backoffice/management`,
//           token: result.message.token,
//         }

//         signIn('credentials', payload);
//       } else {
//         setError(result.error || 'Login failed');
//       }
//     } catch (error: any) {
//       setError('Login failed. Please try again.');
//       console.error('Login failed:', error.message);
//     }
//   };

//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
//       <div style={{ width: '100%' }} className='login-form-container'>
//         <div className="login-form-smaller-laptop-screen rounded bg-[#F0F2F5] p-8 shadow-lg">
//           <div className="form-wrapper">
//             <h1 className="mb-4 text-center text-4xl font-bold">Login</h1>
//             <form style={{ color: 'black' }} onSubmit={handleLogin} className="space-y-4 text-black">
//               <label htmlFor="email" className="block">
//                 Email
//                 <input
//                   type="email"
//                   id="email"
//                   placeholder="Please enter your email"
//                   required
//                   className="mt-1 w-full rounded border p-2"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   autoComplete="off"
//                 />
//               </label>
//               <label htmlFor="password" className="block">
//                 Password
//                 <input
//                   type="password"
//                   id="password"
//                   placeholder="Please enter your password"
//                   required
//                   className="mt-1 w-full rounded border p-2"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   autoComplete="new-password"
//                 />
//               </label>

//               <div className="flex flex-col items-center">
//                 <button
//                   type="submit"
//                   className="mb-4 w-full rounded bg-[#00B3BE] p-2 text-white transition-colors duration-200 hover:bg-[#00838b]"
//                 >
//                   Login
//                 </button>
//                 {/* <a
//                   href={`/${lang}/backoffice/register`}
//                   className="management-login-signup text-[#00B3BE] no-underline hover:no-underline hover:text-[#00838b]"
//                 >
//                   Do not have an Account? Sign up now.
//                 </a> */}
//                 <br /><br /><br /><br />
//               </div>
//               {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
//             </form>
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default Login;


'use client';


import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { loginUser } from '@/services/userService';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import { useModal } from "@/context/useModal";



const Login = ({ lang }: any) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { showModal } = useModal();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  if (userId) {
    router.push(`/${lang}/backoffice/management`);
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const loginData = { email: email, password: password };

    try {
      const result = await loginUser(loginData);
      console.log('show me the result', result);
      if (result.success) {
        let payload = {
          id: result.message.id,
          role: result.message.role,
          callbackUrl: `${lang}/backoffice/management`,
          token: result.message.token,
        }
        showModal('success', 'Login successful');
        signIn('credentials', payload);
      } else {
        setError(result.error || 'Login failed');
        showModal('error', 'Login failed');
      }
    } catch (error: any) {
      setError('Login failed. Please try again.');
      console.error('Login failed:', error.message);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="border-gray-200 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 pb-6">
          <CardTitle className="text-2xl font-bold text-white text-center">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                id="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                type="password"
                id="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full border-gray-300"
              />
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;