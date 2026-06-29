import React from 'react'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from 'next/link';
import './styles/landing.css';

export default function Landing() {
    return (
        <Box className="landing-container">
            <Box className="landing-hero">
                <h1 className="landing-title">E-Commerce Marketplace</h1>
                <p className="landing-tagline">
                    A clean, simple platform for buyers to explore catalogue products and sellers to manage inventory.
                </p>
                <Link href="/login" className="started-link">
                    <Button className='started-button'>Get Started</Button>
                </Link>
            </Box>

            <Box className="landing-features">
                <div className="feature-item">
                    <h3>Explore Products</h3>
                    <p>Browse listings in real-time, view descriptions and prices set directly by sellers.</p>
                </div>
                <div className="feature-item">
                    <h3>Manage Inventory</h3>
                    <p>Sellers can add products, set visibility toggles, and delete listings from their dashboard.</p>
                </div>
                <div className="feature-item">
                    <h3>Role-based Platform</h3>
                    <p>Secured profiles with custom user, seller, and administrator dashboard privileges.</p>
                </div>
            </Box>
        </Box>
    )
}