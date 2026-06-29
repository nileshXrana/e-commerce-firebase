"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import Box from '@mui/material/Box';
import { doc, setDoc } from "firebase/firestore";
import "../ui/styles/signup.css";



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
              <label htmlFor="email-address" className="form-label">
                Email address
              </label>
              <input
                id="email-address"
                type="email"
                required
                disabled={loading}
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
                disabled={loading}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Box>

            <Box className="form-field">
              <label htmlFor="confirm-password" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                disabled={loading}
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
