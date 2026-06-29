"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../lib/firebase";
import Box from '@mui/material/Box';
import { doc, getDoc } from "firebase/firestore";
import "../ui/styles/dashboard.css";
import UserDashboard from "../ui/UserDashboard";
import SellerDashboard from "../ui/SellerDashboard";
import AdminDashboard from "../ui/AdminDashboard";

export default function UserRoleComponent() {
  const [role, setRole] = useState(null);
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setRole(userData.role || "No role assigned");
          } else {
            setRole("No user profile found");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole("Error fetching role");
        }
      } else {
        setRole("Guest / Logged Out");
        setUid(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) return <p>Checking authorization...</p>;

  return (
    <Box className="dashboard-container">
      {role === "user" && <UserDashboard />}
      {role === "seller" && <SellerDashboard sellerId={uid} />}
      {role === "admin" && <AdminDashboard />}
      {(role === "Guest / Logged Out" || !role) && (
        <p className="dashboard-message">Please log in to view the dashboard.</p>
      )}
    </Box>
  );
}
