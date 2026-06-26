"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../lib/firebase";
import Box from '@mui/material/Box';
import { doc, getDoc } from "firebase/firestore";

export default function UserRoleComponent() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
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
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) return <p>Checking authorization...</p>;

  return (
    <Box className="flex flex-col items-center justify-center min-h-[90vh] bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {role == "user" && <p>Welcome to the User Dashboard!</p>}
      {role == "seller" && <p>Welcome to the Seller Dashboard!</p>}
      {role == "admin" && <p>Welcome to the Admin Dashboard!</p>}
    </Box>
  );
}
