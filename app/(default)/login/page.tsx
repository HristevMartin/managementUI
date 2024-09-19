// 'use client';

// import React, { useState } from 'react';
// import { loginUser } from '@/services/userService';
// import { useAuth } from '@/context/AuthContext';
// import { usePathname, useRouter } from 'next/navigation';
// import './login.css';


// const Login: React.FC = () => {
//     const [email, setEmail] = useState<string>('');
//     const [password, setPassword] = useState<string>('');
//     const [error, setError] = useState<string>('');
//     const { login } = useAuth();
//     const router = useRouter();


//     const handleLogin = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
//         event.preventDefault();
//         const loginData = { email, password };

//         try {
//             const result = await loginUser(loginData);
//             if (result.success) {
//                 console.log('Login successful', result.message);
//                 login(result.message);
//                 router.push('/home');
//             } else {
//                 setError(result.error || 'Login failed');
//             }
//         } catch (error: any) {
//             setError('Login failed. Please try again.');
//             console.error('Login failed:', error.message);
//         }
//     };

//     return (
//         <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 bg-opacity-none">
//             <div className="p-8 bg-white shadow-md rounded">
//                 <h1 className="text-xl font-bold mb-4 text-center">Login</h1>
//                 <form onSubmit={handleLogin} className="space-y-4">
//                     <label htmlFor="email" className="block">
//                         Email
//                         <input
//                             type="email"
//                             id="email"
//                             required
//                             className="mt-1 w-full p-2 border rounded"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             autoComplete="off"
//                         />
//                     </label>
//                     <label htmlFor="password" className="block">
//                         Password
//                         <input
//                             type="password"
//                             id="password"
//                             required
//                             className="mt-1 w-full p-2 border rounded"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             autoComplete="new-password"
//                         />
//                     </label>
//                     <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
//                         Login
//                     </button>
//                     {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Login;



'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './login.css';
import { useAuth } from '@/context/AuthContext';
import { loginUser } from '@/services/userService';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { login } = useAuth();
  const router = useRouter();
//   const { isSidebarOpen } = useSidebar();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const loginData = { email: email, password: password };
    console.log('loginData:', loginData);

    try {
      const result = await loginUser(loginData);
      if (result.success) {
        login(result.message);
        router.push('/management');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error: any) {
      setError('Login failed. Please try again.');
      console.error('Login failed:', error.message);
    }
  };

//   const containerClass = `login-container ${isSidebarOpen ? 'sidebar-open-login-form' : 'sidebar-closed-login-form'}`;

  return (
    <div style={{position:'relative', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
      <div>
        <div className="login-form-smaller-laptop-screen rounded bg-white p-8 shadow-md">
          <div className="form-wrapper">
            <h1 className="mb-4 text-center text-xl font-bold">Login</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <label htmlFor="email" className="block">
                Email
                <input
                  type="email"
                  id="email"
                  required
                  className="mt-1 w-full rounded border p-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <label htmlFor="password" className="block">
                Password
                <input
                  type="password"
                  id="password"
                  required
                  className="mt-1 w-full rounded border p-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </label>

              <div className="flex flex-col items-center">
                <button
                  type="submit"
                  className="mb-4 w-full rounded bg-blue-500 p-2 text-white transition-colors duration-200 hover:bg-blue-600"
                >
                  Login
                </button>
                <a
                  href="/register"
                  className="management-login-signup text-blue-500 no-underline hover:no-underline"
                >
                  Do not have an Account? Sign up now.
                </a>
              </div>
              {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
