"use client";

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function CardImageCarousel({ images, name }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Cycles every 3 seconds
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <Box sx={{ height: 200, bgcolor: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Typography variant="body2" color="text.secondary">No Image</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: 200, width: '100%', overflow: 'hidden', bgcolor: '#f3f4f6' }}>
      {images.map((img, i) => (
        <Box
          key={i}
          component="img"
          src={img}
          alt={`${name}-${i}`}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: i === index ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
          }}
        />
      ))}
    </Box>
  );
}
