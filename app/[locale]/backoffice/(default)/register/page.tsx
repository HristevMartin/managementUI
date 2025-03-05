'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './register.css';
import '../login/login.css';
import { validateEmail, validatePassword } from '@/utils/validation';
import { registerUser } from '@/services/userService';
import '../login/login.css';

const Register: React.FC = ({ params }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    repeatPassword: '',
  });

  const router = useRouter();
  const lang = params.locale;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    let emailError = '';
    let passwordError = '';
    let repeatPasswordError = '';

    if (!validateEmail(email)) {
      emailError = 'Please check your email address format.';
    }

    if (!validatePassword(password)) {
      passwordError = 'Password must be at least 8 characters long.';
    }

    if (password !== repeatPassword) {
      repeatPasswordError = "Passwords don't match.";
    }

    setErrors({ email: emailError, password: passwordError, repeatPassword: repeatPasswordError });

    const registrationData = { email, password, password2: repeatPassword, role: 'USER' };
    if (!emailError && !passwordError && !repeatPasswordError) {
      console.log('Registration details:', registrationData);
      try {
        const result = await registerUser(registrationData);
        console.log('show me the result', result);
        if (result.success) {
          alert('Registration successful');
          router.push(`/${lang}/backoffice/login`);
        } else {
          console.log('Registration failed:', result.error);
          setErrors((prev) => ({ ...prev, email: result.error }));
        }
      } catch (error: any) {
        console.error('Registration failed:', error);
        setErrors((prev) => ({ ...prev, email: error.message }));
      }
    }
  };


  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw' }}>
      <div className='login-form-container'>
        <div className="login-form-smaller-laptop-screen rounded bg-[#F0F2F5] p-8 shadow-lg">
          <div className="form-wrapper">
            <h1 className="mb-4 text-center text-4xl font-bold">Register</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {errors.email && <div className="mt-1 text-xs text-red-500">{errors.email}</div>}
              </label>
              <label htmlFor="password" className="block">
                Password
              <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  required
                  className="mt-1 w-full rounded border p-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <div className="mt-1 text-xs text-red-500">{errors.password}</div>
                )}
              </label>
              <label htmlFor="repeatPassword" className="block">
                Repeat Password
              <input
                  type="password"
                  id="repeatPassword"
                  placeholder="Confirm Password"
                  required
                  className="mt-1 w-full rounded border p-2"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  autoComplete="new-password"
                />
                {errors.repeatPassword && (
                  <div className="mt-1 text-xs text-red-500">{errors.repeatPassword}</div>
                )}
              </label>
              <button
                type="submit"
                className="mb-4 w-full rounded bg-[#00B3BE] p-2 text-white transition-colors duration-200 hover:bg-[#00838b]"
              >
                Register
            </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
