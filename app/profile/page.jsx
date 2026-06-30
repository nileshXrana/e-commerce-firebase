"use client";

import React from "react";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import "../ui/styles/profile.css";
import RotateRightIcon from '@mui/icons-material/RotateRight';
import ProfileTab from "../ui/ProfileTab";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("general");

  const [value, setValue] = React.useState('one');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || "");

        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setName(userData.name || "");
            setRole(userData.role || "user");
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          setMessage({ text: "Failed to load profile details.", type: "error" });
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        name: name
      });
      setMessage({ text: "Profile updated successfully!", type: "success" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ text: "Failed to update profile. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box className="profile-container">
        <RotateRightIcon className="infiniteLoader" />
      </Box>
    );
  }

  return (

    <Box>
      <Box sx={{ width: '100%',}}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="secondary tabs example"
        >
          <Tab value="one" label="General" onClick={()=>setActiveTab("general")}/>
          <Tab value="two" label="Address" onClick={() => setActiveTab("address")}/>
          <Tab value="three" label="Privacy" onClick={() => setActiveTab("privacy")}/>  
        </Tabs>
      </Box>

      {/* <Box className="tabs-container">
        <button
          className={`profile-tab ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          General
        </button>
        <button
          className={`profile-tab ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("address")}
        >
          Address
        </button>
        <button
          className={`profile-tab ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("privacy")}
        >
          Privacy
        </button>
      </Box> */}

      {activeTab === "general" && (
        <Box className="profile-container">
          <Box className="profile-card">
            <h1 className="profile-title">Your Profile</h1>

            {message.text && (
              <p className={`profile-message ${message.type}`}>
                {message.text}
              </p>
            )}

            {user && (
              <form onSubmit={handleSave}>
                <Box className="profile-info">
                  <label htmlFor="profile-name">Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    className="profile-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </Box>

                <Box className="profile-info">
                  <label>Email address</label>
                  <p>{email}</p>
                </Box>

                <Box className="profile-info">
                  <label>Account Role</label>
                  <p style={{ textTransform: "capitalize" }}>{role}</p>
                </Box>

                <button
                  type="submit"
                  className="profile-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </Box>
        </Box>
      )}

      {activeTab === "address" && (
        <Box className="profile-container">
          <Box className="profile-card">
            <h1 className="profile-title">Saved Address</h1>

            {user && (
              <form onSubmit={handleSave}>
                <Box className="profile-info">
                  <label htmlFor="profile-name">Address</label>
                  <input
                    id="profile-name"
                    type="text"
                    className="profile-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </Box>

                <Box className="profile-info">
                  <label>Account Role</label>
                  <p style={{ textTransform: "capitalize" }}>{role}</p>
                </Box>

                <button
                  type="submit"
                  className="profile-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </Box>
        </Box>
      )}

    </Box>
  );
}
