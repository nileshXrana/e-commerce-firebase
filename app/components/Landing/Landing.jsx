"use client";
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/services/firebase.service";
import './Landing.css';

export default function Landing() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = () => {
        signOut(auth).catch((error) => {
            console.error("Logout failed", error);
        });
    };

    return (
        <Box className="landing-container">
            <Box className="landing-hero">
                <h1 className="landing-title">E-Commerce Marketplace</h1>
                <p className="landing-tagline">
                    A simple platform for buyers to explore and buy products and sellers to manage inventory.
                </p>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {user ? (
                        <button onClick={handleLogout} className="started-link" style={{ border: 'none', cursor: 'pointer', outline: 'none' }}>
                            <Button className='started-button' component="span">Logout</Button>
                        </button>
                    ) : (
                        <Link href="/login" className="started-link">
                            <Button className='started-button'>Login</Button>
                        </Link>
                    )}
                    <Link href="/dashboard" className="started-link secondary-link">
                        <Button className='started-button secondary-button'>View Dashboard</Button>
                    </Link>
                </Box>
            </Box>
        </Box>
    );
}