import React from 'react'
import './styles/loginform.css'
import Box from '@mui/material/Box';
import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import {redirect} from "next/navigation";


const LoginForm = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // Track the authentication state of the user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Logged in user:", result.user);
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Success! Account created:", userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };
  return (

    <Box className="loginform">
      {user ? (
        redirect("/dashboard")
      ) : (

        <Box className="w-full max-w-md space-y-8 rounded-xl bg-violet-50 p-8 shadow-md">

          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 font-medium border border-red-200">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="mt-8 space-y-5" onSubmit={handleSignUp}>
            <div className="space-y-4">
              {/* Email Field */}
              <Box>
                <label htmlFor="email-address" className="text-sm font-medium text-gray-700 block mb-1">
                  Email address
                </label>
                <input
                  id="email-address"
                  type="email"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Box>

              {/* Password Field */}
              <Box>
                <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Box>
            </div>

            {/* Action Buttons */}
            <Box className="space-y-3 pt-2">
              {/* Primary Login Button */}
              <button
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                type="submit"
              >
                Sign In
              </button>

              {/* Divider text */}
              <div className="relative flex py-2 items-center">
                <div className=" border-t border-gray-200"></div>
                <span className="mx-4 text-xs uppercase text-gray-400 font-semibold tracking-wider">or</span>
                <div className=" border-t border-gray-200"></div>
              </div>

              {/* Google Authentication Button */}
              <button
                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                type="button"
                onClick={handleSignIn}
              >
                {/* Simple Inline Google 'G' Icon */}
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.7 8.91 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.98 3.7-8.71z" />
                  <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9C.54 8.84 0 11 0 13.2s.54 4.36 1.5 6.3l3.86-3z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.03.69-2.35 1.1-3.93 1.1-3.09 0-5.73-2.66-6.66-5.46l-3.86 3C3.4 20.35 7.35 23 12 23z" />
                </svg>
                Continue with Google
              </button>
            </Box>
          </form>

          {/* Footer Navigation Link */}
          <div className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign up here
            </Link>
          </div>
        </Box>

      )}

    </Box>

  )
}

export default LoginForm





