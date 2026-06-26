import React from 'react'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from 'next/link';

export default function Landing() {
    return (
        <Box className="text-4xl font-bold text-center mt-8 flex flex-col items-center justify-center h-[70vh]">
            <Box>
                THIS IS A LANDING PAGE
            </Box>
            <Link href="/login" className="mt-4 bg-gray-800 rounded-sm p-2 ">
                <Button className='text-green-300'>Get Started</Button>
            </Link>
        </Box>
    )
}