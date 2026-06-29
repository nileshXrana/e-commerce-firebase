// "use client";
import React from 'react'
import './styles/loginform.css'
import Box from '@mui/material/Box';
import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";


const Login = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  // auth : 
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

  const noramSignIn = async (e) => {
    e.preventDefault();
    console.log("Attempting to sign in with email:", email);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Logged in user:", user);
        router.push("/dashboard");
      })
      .catch((error) => {
        console.error("Login failed:", error.message);
      });
  }

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

        <form className="login-form" onSubmit={noramSignIn}>
          <div className="form-fields">
            {/* Email Field */}
            <Box className="form-field">
              <label htmlFor="email-address" className="form-label">
                Email address
              </label>
              <input
                id="email-address"
                type="email"
                required
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Box>

            <Box className="form-field">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
            {/* Google Sign-In Button */}
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

        {/* Footer  */}
        <div className="login-footer">
          {"Don't have an account? "}
          <Link href="/signup" className="login-link">
            Sign up here
          </Link>
        </div>
      </Box>

    </Box>

  )
}

export default Login





