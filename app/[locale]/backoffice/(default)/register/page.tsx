'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { registerUser } from '@/services/userService';
import { signIn } from 'next-auth/react';
import { useModal } from "@/context/useModal";


const Register = ({ lang }: { lang: string }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    repeatPassword: '',
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const { showModal } = useModal();


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
        if (result.success) {
          showModal('success', 'Registration successful please login');
          let payload = {
            id: result.data.id || '1',
            role: result.data.roles || 'USER',
            callbackUrl: `${lang}/backoffice/management` || '',
            token: result.data.token || '',
          }

          signIn('credentials', payload);

        } else {
          console.log('Registration failed:', result.error);
          setErrors((prev) => ({ ...prev, email: result.error }));
          showModal('error', 'Registration failed, please try again');
        }
      } catch (error: any) {
        console.error('Registration failed:', error);
        setErrors((prev) => ({ ...prev, email: error.message }));
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="border-gray-200 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 pb-6">
          <CardTitle className="text-2xl font-bold text-white text-center">
            Register
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="register-email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                id="register-email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full border-gray-300"
              />
              {errors.email && <div className="text-xs text-red-500 mt-1">{errors.email}</div>}
            </div>

            <div className="space-y-2">
              <label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                type="password"
                id="register-password"
                placeholder="Create a password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full border-gray-300"
              />
              {errors.password && <div className="text-xs text-red-500 mt-1">{errors.password}</div>}
            </div>

            <div className="space-y-2">
              <label htmlFor="repeat-password" className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <Input
                type="password"
                id="repeat-password"
                placeholder="Confirm your password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full border-gray-300"
              />
              {errors.repeatPassword && <div className="text-xs text-red-500 mt-1">{errors.repeatPassword}</div>}
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;