"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/app/services/firebase.service";
import Box from '@mui/material/Box';
import { doc, getDoc } from "firebase/firestore";
import "./page.css";
import UserDashboard from "./components/UserDashboard/UserDashboard";
import SellerDashboard from "./components/SellerDashboard/SellerDashboard"
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";

export default function UserRoleComponent() {
  const [role, setRole] = useState(null);
  const [uid, setUid] = useState(null);

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
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <Box className="dashboard-container">
      {(role === "user" || role === "Guest / Logged Out" || !role) && <UserDashboard />}
      {role === "seller" && <SellerDashboard sellerId={uid} />}
      {role === "admin" && <AdminDashboard />}
    </Box>
  );
}
