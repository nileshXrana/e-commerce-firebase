"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/services/firebase.service";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import Box from '@mui/material/Box';
import { doc, setDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import "./Signup.css";

const signupSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  role: z.enum(["user", "seller"], {
    errorMap: () => ({ message: "Please select a role" })
  }),
  address: z.string().min(5, "Address must be at least 5 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Signup() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema)
  });

  const handleSignup = async (data) => {
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      const userDocRef = doc(db, "users", user.uid);

      await setDoc(userDocRef, {
        uid: user.uid,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: new Date(),
        addresses: [
          {
            id: "addr_signup_default",
            addressLine: data.address,
            isDefault: true
          }
        ]
      });
      
      router.push("/dashboard");  
    } catch (err) {
      console.error(err);
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

        <form className="signup-form" onSubmit={handleSubmit(handleSignup)}> 
          <Box className="form-fields">
            <Box className="form-field">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                id="name"
                type="text"
                disabled={loading}
                className="form-input"
                placeholder="full name"
                {...register("name")}
              />
              {errors.name && <span className="field-error">{errors.name.message}</span>}
            </Box>
            <Box className="form-field">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                disabled={loading}
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
                disabled={loading}
                className="form-input"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </Box>

            <Box className="form-field">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                disabled={loading}
                className="form-input"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword.message}</span>}
            </Box>

            <Box className="form-field">
              <label htmlFor="address" className="form-label">
                Address
              </label>
              <input
                id="address"
                type="text"
                disabled={loading}
                className="form-input"
                placeholder="your home address"
                {...register("address")}
              />
              {errors.address && <span className="field-error">{errors.address.message}</span>}
            </Box>

            <Box className="form-field">
              <label htmlFor="role" className="form-label">
                Role
              </label>
              <select
                id="role"
                disabled={loading}
                className="form-select"
                {...register("role")}
              >
                <option value="">Select a role</option>
                <option value="user">User</option>
                <option value="seller">Seller</option>
              </select>
              {errors.role && <span className="field-error">{errors.role.message}</span>}
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