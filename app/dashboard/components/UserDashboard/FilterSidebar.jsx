"use client";

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

export default function FilterSidebar({
  sortBy,
  setSortBy,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedSellers,
  setSelectedSellers,
  uniqueSellers,
  onClearFilters
}) {
  const handleSellerCheckboxChange = (sellerId) => {
    if (selectedSellers.includes(sellerId)) {
      setSelectedSellers(selectedSellers.filter(id => id !== sellerId));
    } else {
      setSelectedSellers([...selectedSellers, sellerId]);
    }
  };

  return (
    <Box className="filter-card">
      <Typography className="filter-title" variant="h6">
        Filters
      </Typography>

      {/* Sort Section */}
      <Box className="filter-section">
        <Typography className="filter-section-title">Sort By</Typography>
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="sort-by"
            name="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <FormControlLabel
              value="price-asc"
              control={<Radio size="small" />}
              label="Price: Low to High"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
            />
            <FormControlLabel
              value="price-desc"
              control={<Radio size="small" />}
              label="Price: High to Low"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
            />
            <FormControlLabel
              value="alpha-asc"
              control={<Radio size="small" />}
              label="Alphabetical: A-Z"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
            />
            <FormControlLabel
              value="alpha-desc"
              control={<Radio size="small" />}
              label="Alphabetical: Z-A"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
            />
          </RadioGroup>
        </FormControl>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Price Filter Section */}
      <Box className="filter-section">
        <Typography className="filter-section-title">Price Range</Typography>
        <Box className="price-inputs">
          <TextField
            label="Min"
            type="number"
            size="small"
            value={minPrice}
            onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value) || 0))}
            className="price-input"
            slotProps={{
              htmlInput: { min: 0 }
            }}
          />
          <Typography color="text.secondary">-</Typography>
          <TextField
            label="Max"
            type="number"
            size="small"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Math.max(0, Number(e.target.value) || 0))}
            className="price-input"
            slotProps={{
              htmlInput: { min: 0 }
            }}
          />
        </Box>
      </Box>

      {uniqueSellers.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          {/* Seller Filter Section */}
          <Box className="filter-section">
            <Typography className="filter-section-title">Sellers</Typography>
            <Box className="seller-checkbox-group">
              <FormGroup>
                {uniqueSellers.map((seller) => (
                  <FormControlLabel
                    key={seller.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedSellers.includes(seller.id)}
                        onChange={() => handleSellerCheckboxChange(seller.id)}
                        sx={{
                          color: '#000000',
                          '&.Mui-checked': {
                            color: '#000000',
                          },
                        }}
                      />
                    }
                    label={seller.name}
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}
                  />
                ))}
              </FormGroup>
            </Box>
          </Box>
        </>
      )}

      <Box className="clear-btn-container">
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={onClearFilters}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#e5e7eb',
            '&:hover': {
              borderColor: '#000000',
              backgroundColor: '#f9fafb'
            }
          }}
        >
          Clear All Filters
        </Button>
      </Box>
    </Box>
  );
}
