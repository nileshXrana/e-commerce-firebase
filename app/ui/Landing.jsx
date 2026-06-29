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
                    A simple platform for buyers to explore and buy products and sellers to manage inventory.
                </p>
                <Link href="/login" className="started-link">
                    <Button className='started-button'>Get Started</Button>
                </Link>
            </Box>

        </Box>
    )
}