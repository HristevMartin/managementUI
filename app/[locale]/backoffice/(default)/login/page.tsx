'use client';

import React, { useState } from 'react';
import './login.css';
import { loginUser } from '@/services/userService';
import { signIn } from 'next-auth/react';
<<<<<<< HEAD:app/[locale]/backoffice/(default)/login/page.tsx
import { sign } from 'crypto';
import path from 'path';
import LocaleSwitcher from '@/components/LocaleSwitcher';
=======

>>>>>>> locale-management:app/backoffice/(default)/login/page.tsx

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const pathname = usePathname();
  const locale = pathname?.split('/')[1];
  console.log('show me the pathname', locale);


  const handleLogin = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const loginData = { email: email, password: password };

    try {
      const result = await loginUser(loginData);
      console.log('show me the result', result);

      if (result.success) {
        let payload = {
          id: result.message.id,
          role: result.message.roles,
<<<<<<< HEAD:app/[locale]/backoffice/(default)/login/page.tsx
          callbackUrl: `${locale}/backoffice/management`,
=======
          token: result.message.token,
          callbackUrl: '/backoffice/management',
>>>>>>> locale-management:app/backoffice/(default)/login/page.tsx
        }

        signIn('credentials', payload);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error: any) {
      setError('Login failed. Please try again.');
      console.error('Login failed:', error.message);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw' }}>
      <div className='login-form-container'>
        <div className="login-form-smaller-laptop-screen rounded bg-white p-8 shadow-md">
          <div className="form-wrapper">
            <h1 className="mb-4 text-center text-xl font-bold">Login</h1>
            <form style={{ color: 'black' }} onSubmit={handleLogin} className="space-y-4 text-black">
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
                  href="/backoffice/register"
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
      {/* <div>
        <LocaleSwitcher />
      </div> */}
    </div>
  );
};

export default Login;
