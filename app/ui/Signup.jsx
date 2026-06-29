"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import Box from '@mui/material/Box';
import { doc, setDoc } from "firebase/firestore";
import "./styles/signup.css";

export default function Signup() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (e.target.password.value !== e.target.confirmPassword.value) {
      return setError("Passwords do not match.");
    }

    if (e.target.password.value.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    setLoading(true);

    try {
     
      const userCredential = await createUserWithEmailAndPassword(auth, e.target.email.value, e.target.password.value);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);

      await setDoc(userDocRef, {
      uid: user.uid,
      name: e.target.name.value,
      email: e.target.email.value,
      role: e.target.role.value,
      createdAt: new Date(),
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
    <Box className="signup-container">
      <Box className="signup-card">
        <Box className="signup-header">
          <h2 className="signup-title">Create an account</h2>
          <p className="signup-subtitle">Sign Up Now !</p>
        </Box>

        {error && (
          <Box className="error-box">
            {error}
          </Box>
        )}

        <form className="signup-form" onSubmit={handleSignup}> 
          <Box className="form-fields">
            <Box className="form-field">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                disabled={loading}
                className="form-input"
                placeholder="full name"
              />
            </Box>
            <Box className="form-field">
              <label htmlFor="emailAddress" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={loading}
                className="form-input"
                placeholder="you@example.com"
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
                disabled={loading}
                className="form-input"
                placeholder="••••••••"
              />
            </Box>

            <Box className="form-field">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                disabled={loading}
                className="form-input"
                placeholder="••••••••"
              />
            </Box>

            <Box className="form-field">
              <label htmlFor="role" className="form-label">
                Role
              </label>
              <select
                id="role"
                required
                disabled={loading}
                className="form-select"
              >
                <option value="">Select a role</option>
                <option value="user">User</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </Box>
          </Box>

          <Box className="btn-container">
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </Box>
        </form>

        <Box className="signup-footer">
          Already have an account?{" "}
          <Link href="/login" className="signup-link">
            Log in here
          </Link>
        </Box>
      </Box>
    </Box>
  );
}