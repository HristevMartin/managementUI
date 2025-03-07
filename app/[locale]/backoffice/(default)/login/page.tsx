'use client';

import React, { useState } from 'react';
import './login.css';
import { loginUser } from '@/services/userService';
import { signIn, useSession } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import { auth } from '@/auth';

const Login: React.FC = ({ lang }: any) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

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

      if (result.success) {
        let payload = {
          id: result.message.id,
          role: result.message.roles,
          callbackUrl: `${lang}/backoffice/management`,
          token: result.message.token,
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <div style={{ width: '100%' }} className='login-form-container'>
        <div className="login-form-smaller-laptop-screen rounded bg-[#F0F2F5] p-8 shadow-lg">
          <div className="form-wrapper">
            <h1 className="mb-4 text-center text-4xl font-bold">Login</h1>
            <form style={{ color: 'black' }} onSubmit={handleLogin} className="space-y-4 text-black">
              <label htmlFor="email" className="block">
                Email
                <input
                  type="email"
                  id="email"
                  placeholder="Please enter your email"
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
                  placeholder="Please enter your password"
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
                  className="mb-4 w-full rounded bg-[#00B3BE] p-2 text-white transition-colors duration-200 hover:bg-[#00838b]"
                >
                  Login
                </button>
                {/* <a
                  href={`/${lang}/backoffice/register`}
                  className="management-login-signup text-[#00B3BE] no-underline hover:no-underline hover:text-[#00838b]"
                >
                  Do not have an Account? Sign up now.
                </a> */}
                <br /><br /><br /><br />
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
