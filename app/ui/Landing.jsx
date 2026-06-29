import React from 'react'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from 'next/link';
import './styles/landing.css';

export default function Landing() {
    return (
        <Box className="landing-container">
            <Box>
                THIS IS A LANDING PAGE
            </Box>
            <Link href="/login" className="started-link">
                <Button className='started-button'>Get Started</Button>
            </Link>
        </Box>
    )
}