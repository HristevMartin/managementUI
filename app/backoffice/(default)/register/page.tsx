// 'use client';

// import { validateEmail, validatePassword } from '@/utils/validation';
// import React, { useState } from 'react';
// import { registerUser } from '@/services/userService';
// import { usePathname, useRouter } from 'next/navigation';
// import './register.css';


// const Register: React.FC = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [repeatPassword, setRepeatPassword] = useState('');
//     const [errors, setErrors] = useState({
//         email: '',
//         password: '',
//         repeatPassword: ''
//     });

//     const router = useRouter();

//     const handleSubmit = async (event: React.FormEvent) => {
//         event.preventDefault();
//         let emailError = '';
//         let passwordError = '';
//         let repeatPasswordError = '';

//         if (!validateEmail(email)) {
//             emailError = 'Please check your email address format.';
//         }

//         if (!validatePassword(password)) {
//             passwordError = 'Password must be at least 8 characters long.';
//         }

//         if (password !== repeatPassword) {
//             repeatPasswordError = "Passwords don't match.";
//         }

//         setErrors({ email: emailError, password: passwordError, repeatPassword: repeatPasswordError });

//         const registrationData = { email, password, repeatPassword };
//         if (!emailError && !passwordError && !repeatPasswordError) {
//             console.log('Registration details:', { email, password });
//             try {
//                 const result = await registerUser(registrationData);
//                 if (result.success) {
//                     alert('Registration successful');
//                     router.push('/login');
//                 } else {
//                     console.log('Registration failed:', result.error);
//                     setErrors(prev => ({ ...prev, email: result.error }));
//                 }
//             } catch (error: any) {
//                 console.error('Registration failed:', error);
//                 setErrors(prev => ({ ...prev, email: error.message }));
//             }
//         }
//     };

//     return (
//         <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 bg-opacity-none">
//             <div className="p-8 bg-white shadow-md rounded">
//                 <h1 className="text-xl font-bold mb-4 text-center">Register</h1>
//                 <form onSubmit={handleSubmit} className="space-y-4">
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
//                         {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
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
//                         {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
//                     </label>
//                     <label htmlFor="repeatPassword" className="block">
//                         Repeat Password
//                         <input
//                             type="password"
//                             id="repeatPassword"
//                             required
//                             className="mt-1 w-full p-2 border rounded"
//                             value={repeatPassword}
//                             onChange={(e) => setRepeatPassword(e.target.value)}
//                             autoComplete="new-password"
//                         />
//                         {errors.repeatPassword && <div className="text-red-500 text-xs mt-1">{errors.repeatPassword}</div>}
//                     </label>
//                     <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
//                         Register
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Register;


'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './register.css';
// import { useSidebar } from '~/context/SidebarContext';
import '../login/login.css';
import { validateEmail, validatePassword } from '@/utils/validation';
import { registerUser } from '@/services/userService';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    repeatPassword: '',
  });


  const router = useRouter();

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

    const registrationData = { email, password, password2: repeatPassword, role: 'management' };
    if (!emailError && !passwordError && !repeatPasswordError) {
      console.log('Registration details:', registrationData);
      try {
        const result = await registerUser(registrationData);
        if (result.success) {
          alert('Registration successful');
          router.push('/backoffice/login');
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
    <div>
      <div className="bg-opacity-none flex h-[620px] flex-col items-center justify-center bg-gray-100">
        <div className="mt-20 rounded bg-white p-8 shadow-md">
          <h1 className="mb-4 text-center text-xl font-bold">Register</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              {errors.email && <div className="mt-1 text-xs text-red-500">{errors.email}</div>}
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
              {errors.password && (
                <div className="mt-1 text-xs text-red-500">{errors.password}</div>
              )}
            </label>
            <label htmlFor="repeatPassword" className="block">
              Repeat Password
              <input
                type="password"
                id="repeatPassword"
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
              className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
