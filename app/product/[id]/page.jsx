"use client";

import React, { use, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useRouter } from 'next/navigation';
import { db } from "@/app/services/firebase.service";
import { doc, getDoc } from "firebase/firestore";
import './product.css';

export default function ProductDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [sellerName, setSellerName] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [cart, setCart] = useState([]);

  // Fetch product and seller information
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);

          if (productData.sellerId) {
            const sellerRef = doc(db, "users", productData.sellerId);
            const sellerSnap = await getDoc(sellerRef);
            if (sellerSnap.exists()) {
              setSellerName(sellerSnap.data().name || sellerSnap.data().email || "Unknown Seller");
            } else {
              setSellerName("Unknown Seller");
            }
          }
        } else {
          console.error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Load and listen to cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const syncCart = () => {
      const updated = localStorage.getItem("cart");
      if (updated) {
        setCart(JSON.parse(updated));
      }
    };
    window.addEventListener("cartUpdated", syncCart);
    return () => window.removeEventListener("cartUpdated", syncCart);
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const addToCart = () => {
    if (!product) return;
    const existing = cart.find(item => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    updateCart(newCart);
  };

  const decreaseQty = () => {
    if (!product) return;
    const existing = cart.find(item => item.id === product.id);
    if (!existing) return;

    let newCart;
    if (existing.quantity > 1) {
      newCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      );
    } else {
      newCart = cart.filter(item => item.id !== product.id);
    }
    updateCart(newCart);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const existing = cart.find(item => item.id === product.id);
    if (!existing) {
      const newCart = [...cart, { ...product, quantity: 1 }];
      updateCart(newCart);
    }
    router.push("/cart");
  };

  if (loading) {
    return (
      <Box className="loading-wrapper">
        <CircularProgress color="inherit" />
        <Typography variant="body1" color="text.secondary">Loading product details...</Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box className="product-detail-container" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>Product Not Found</Typography>
        <Button variant="contained" onClick={() => router.push("/dashboard")} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const cartItem = cart.find(item => item.id === product.id);
  const isAdded = !!cartItem;
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <Box className="product-detail-container">
      {/* Back button */}
      <Box className="back-btn-wrapper">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard")}
          sx={{
            color: '#374151',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#f3f4f6'
            }
          }}
        >
          Back to Products
        </Button>
      </Box>

      {/* Side-by-side details */}
      <Box className="product-grid-layout">
        {/* Left: Gallery */}
        <Box className="gallery-wrapper">
          <Box className="main-image-container">
            {product.images && product.images.length > 0 ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.images[activeImageIndex]}
                alt={product.name}
                className="main-product-image"
              />
            ) : (
              <Typography color="text.secondary">No Image Available</Typography>
            )}
          </Box>

          {product.images && product.images.length > 1 && (
            <Box className="thumbnails-list">
              {product.images.map((img, index) => (
                <Box
                  key={index}
                  className={`thumbnail-item ${index === activeImageIndex ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={img} alt={`thumbnail-${index}`} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Right: Info */}
        <Box className="info-wrapper">
          <Box>
            <Typography variant="caption" className="seller-info">
              Seller: {sellerName}
            </Typography>
            <Typography className="product-title" variant="h4" component="h1" sx={{ mt: 0.5 }}>
              {product.name}
            </Typography>
          </Box>

          <Typography className="product-price-tag">
            ${product.price ? product.price.toFixed(2) : "0.00"}
          </Typography>

          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#374151' }}>
              Description
            </Typography>
            <Typography className="product-desc-text">
              {product.description || "No description provided."}
            </Typography>
          </Box>

          {/* Action box */}
          <Box className="actions-card">
            <Typography className="actions-title">Purchase Details</Typography>
            <Typography className="actions-qty-desc">
              {isAdded ? `You have ${quantity} of this item in your cart.` : "Item is not in your cart yet."}
            </Typography>

            <Box className="buttons-group">
              {/* Add to Cart / Qty Controls */}
              {!isAdded ? (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<ShoppingCartIcon />}
                  onClick={addToCart}
                  sx={{
                    bgcolor: '#000000',
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.2,
                    '&:hover': { bgcolor: '#1f2937' }
                  }}
                >
                  Add to Cart
                </Button>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    height: '42.5px',
                    overflow: 'hidden'
                  }}
                >
                  <Button
                    onClick={decreaseQty}
                    sx={{ minWidth: '60px', color: '#374151', fontSize: '1.25rem', fontWeight: 600, height: '100%' }}
                  >
                    -
                  </Button>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
                    {quantity}
                  </Typography>
                  <Button
                    onClick={addToCart}
                    sx={{ minWidth: '60px', color: '#374151', fontSize: '1.25rem', fontWeight: 600, height: '100%' }}
                  >
                    +
                  </Button>
                </Box>
              )}

              {/* Buy Now Button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ShoppingBagIcon />}
                onClick={handleBuyNow}
                sx={{
                  color: '#000000',
                  borderColor: '#000000',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.2,
                  '&:hover': {
                    bgcolor: '#f9fafb',
                    borderColor: '#000000'
                  }
                }}
              >
                Buy Now
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
