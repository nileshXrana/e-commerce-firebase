"use client";

import React, { useEffect, useState } from 'react';
import './styles/login.css';
import Box from '@mui/material/Box';
import { auth, googleProvider, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const noramSignIn = async (data) => {
    setError("");
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then(async (userCredential) => {
        const userDocRef = doc(db, "users", userCredential.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          await signOut(auth);
          setError("Your account has been deleted or does not exist.");
        } else if (userDocSnap.data().disabled === true) {
          await signOut(auth);
          setError("Your account has been disabled by the administrator.");
        } else {
          router.push("/dashboard");
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDocRef = doc(db, "users", result.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists() && userDocSnap.data().disabled === true) {
        await signOut(auth);
        setError("Your account has been disabled.");
      } else {
        if(!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            uid: result.user.uid,
            name: result.user.displayName,
            email: result.user.email,
            role: "user",
            createdAt: new Date(),
          });
        }
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box className="login-container">
      <Box className="login-card">
        <div className="login-header">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Please sign in to your account</p>
        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit(noramSignIn)}>
          <div className="form-fields">
            <Box className="form-field">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </Box>

            <Box className="form-field">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </Box>
          </div>

          <Box className="btn-container">
            <button
              className="btn-submit"
              type="submit"
            >
              Sign In
            </button>

            <div className="divider">
              <span className="divider-text">or</span>
            </div>

            <button
              className="btn-google"
              type="button"
              onClick={handleSignIn}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.7 8.91 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.98 3.7-8.71z" />
                <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9C.54 8.84 0 11 0 13.2s.54 4.36 1.5 6.3l3.86-3z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.03.69-2.35 1.1-3.93 1.1-3.09 0-5.73-2.66-6.66-5.46l-3.86 3C3.4 20.35 7.35 23 12 23z" />
              </svg>
              Continue with Google
            </button>
          </Box>
        </form>

        <div className="login-footer">
          {"Don't have an account? "}
          <Link href="/signup" className="login-link">
            Sign up here
          </Link>
        </div>
      </Box>
    </Box>
  );
}
