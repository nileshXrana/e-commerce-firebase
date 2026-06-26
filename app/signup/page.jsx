"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import Box from '@mui/material/Box';
import { doc, setDoc } from "firebase/firestore";



export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    setLoading(true);

    try {
     
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);

      await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      createdAt: new Date(),
      role: e.target.role.value 
    });
      
      router.push("/dashboard");  
    } catch (err) {
      console.error("Error during sign-up:", err);
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("This email address is already registered.");
          break;
        case "auth/invalid-email":
          setError("Please provide a valid email format.");
          break;
        case "auth/weak-password":
          setError("The chosen password is too weak.");
          break;
        default:
          setError("An error occurred during registration. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex min-h-screen items-center justify-center px-4">
      <Box className="w-full max-w-md space-y-8 border-gray-200 border rounded-xl bg-violet-50 p-8 shadow-md">
        <Box className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create an account</h2>
          <p className="mt-2 text-sm text-gray-600">Sign Up Now !</p>
        </Box>

        {error && (
          <Box className="rounded-md bg-red-50 p-4 text-sm text-red-700 font-medium border border-red-200">
            {error}
          </Box>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignup}> 
          <Box className="space-y-4">
            <Box>
              <label htmlFor="email-address" className="text-sm font-medium text-gray-700 block mb-1">
                Email address
              </label>
              <input
                id="email-address"
                type="email"
                required
                disabled={loading}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:bg-gray-100"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Box>

            <Box>
              <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                disabled={loading}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:bg-gray-100"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Box>

            <Box>
              <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 block mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                disabled={loading}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:bg-gray-100"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Box>

            <Box>
              <label htmlFor="role" className="text-sm font-medium text-gray-700 block mb-1">
                Role
              </label>
              <select
                id="role"
                required
                disabled={loading}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-600 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:bg-gray-100"
              >
                <option value="">Select a role</option>
                <option value="user">User</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>

             
            </Box>
          </Box>

          <Box>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </Box>
        </form>

        <Box className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in here
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
