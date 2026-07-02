import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Drawer from '@mui/material/Drawer';
import { db, auth } from "@/app/services/firebase.service";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import FilterSidebar from './FilterSidebar';
import CardImageCarousel from './CardImageCarousel';
import './UserDashboard.css';
import { useDebounce } from 'use-debounce';

const UserDashboard = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState({});
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });
  const [open, setOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [sortBy, setSortBy] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [maxLimitPrice, setMaxLimitPrice] = useState(1000);
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasInitializedPrice, setHasInitializedPrice] = useState(false);

  // Initialize Price Range bounds when products load
  useEffect(() => {
    if (products.length > 0 && !hasInitializedPrice) {
      const highestPrice = Math.max(...products.map(p => p.price || 0));
      const ceilMax = Math.ceil(highestPrice) || 1000;
      setMaxLimitPrice(ceilMax);
      setMaxPrice(ceilMax);
      setHasInitializedPrice(true);
    }
  }, [products, hasInitializedPrice]);

  // Listen for mobile sidebar toggle from navbar
  useEffect(() => {
    const handleToggle = () => setMobileOpen(prev => !prev);
    window.addEventListener("toggleFilterSidebar", handleToggle);
    return () => window.removeEventListener("toggleFilterSidebar", handleToggle);
  }, []);

  // Listen for search inputs from Navbar
  useEffect(() => {
    const handleSearch = (e) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener("dashboardSearch", handleSearch);
    return () => window.removeEventListener("dashboardSearch", handleSearch);
  }, []);

  // Compute list of sellers with active products
  const uniqueSellers = React.useMemo(() => {
    const ids = Array.from(new Set(products.map(p => p.sellerId)));
    return ids
      .map(id => ({ id, name: sellers[id] || "Loading..." }))
      .filter(s => s.id && s.name && s.name !== "Loading...");
  }, [products, sellers]);

  // Apply filters and sorting to products
  const filteredProducts = React.useMemo(() => {
    return products
      .filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                              (product.description && product.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
        
        const price = product.price || 0;
        const matchesPrice = price >= minPrice && price <= maxPrice;
        
        const matchesSeller = selectedSellers.length === 0 || selectedSellers.includes(product.sellerId);
        
        return matchesSearch && matchesPrice && matchesSeller;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          return (a.price || 0) - (b.price || 0);
        }
        if (sortBy === 'price-desc') {
          return (b.price || 0) - (a.price || 0);
        }
        if (sortBy === 'alpha-asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'alpha-desc') {
          return b.name.localeCompare(a.name);
        }
        return 0;
      });
  }, [products, debouncedSearchQuery, sortBy, minPrice, maxPrice, selectedSellers]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSortBy("");
    setMinPrice(0);
    setMaxPrice(maxLimitPrice);
    setSelectedSellers([]);
    // Dispatch event to clear Navbar search
    window.dispatchEvent(new Event("clearDashboardSearch"));
  };

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const sellersMap = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        sellersMap[doc.id] = data.name || data.email || "Unknown Seller";
      });
      setSellers(sellersMap);
    });

    const q = query(
      collection(db, "products"),
      where("show", "==", true)
    );

    const unsubscribeProducts = onSnapshot(q, (snapshot) => {
      const productsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsList);
      console.log("Fetched products:", productsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeProducts();
    };
  }, []);

  // Selected product timer removed (page navigation replaced details modal)

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const addToCart = (product) => {
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

  const decreaseQty = (productId) => {
    const existing = cart.find(item => item.id === productId);
    if (!existing) return;

    let newCart;
    if (existing.quantity > 1) {
      newCart = cart.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    } else {
      newCart = cart.filter(item => item.id !== productId);
    }
    updateCart(newCart);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Dialog state helper variables removed

  const sidebarProps = {
    sortBy,
    setSortBy,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    maxLimitPrice,
    selectedSellers,
    setSelectedSellers,
    uniqueSellers,
    onClearFilters: handleClearFilters
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={open}
        autoHideDuration={2000}
        onClose={() => setOpen(false)}
        message="Item Added"
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setOpen(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      {products.length === 0 ? (
        <Box sx={{ p: 4 }}>
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', color: 'text.secondary', py: 8, fontStyle: 'italic' }}
          >
            No products are currently available.
          </Typography>
        </Box>
      ) : (
        <Box className="user-dashboard-wrapper">
          {/* Desktop Filter Sidebar */}
          <Box className="sidebar-desktop-container" sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box className="sticky-sidebar-content">
              <FilterSidebar {...sidebarProps} />
            </Box>
          </Box>

          {/* Mobile Filter Sidebar Drawer */}
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, p: 0 },
            }}
          >
            <FilterSidebar {...sidebarProps} />
          </Drawer>

          {/* Products Grid Content Area */}
          <Box className="products-content-area">
            <Box className="results-summary">
              <Typography className="results-count">
                {filteredProducts.length === 0
                  ? "No products found"
                  : `Showing ${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'}`
                }
              </Typography>
            </Box>

            {filteredProducts.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                  No products match your filter criteria.
                </Typography>
                <Button variant="outlined" color="inherit" onClick={handleClearFilters}>
                  Reset Filters
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredProducts.map((product) => {
                  const cartItem = cart.find(item => item.id === product.id);
                  const isAdded = !!cartItem;
                  const qty = cartItem ? cartItem.quantity : 0;

                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id} sx={{ display: 'flex' }}>
                      <Card
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.56)',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 16px rgb(0, 0, 0)'
                          }
                        }}
                      >
                        <CardActionArea
                          onClick={() => router.push(`/product/${product.id}`)}
                          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                        >
                          <CardImageCarousel images={product.images} name={product.name} />
                          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold' }}>
                              Seller: {sellers[product.sellerId] || "Loading..."}
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              component="h2"
                              sx={{
                                fontWeight: 600,
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                height: '2.8em'
                              }}
                            >
                              {product.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                height: '2.8em'
                              }}
                            >
                              {product.description || "No description provided."}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0284c7', mt: 'auto' }}>
                              ${product.price ? product.price.toFixed(2) : "0.00"}
                            </Typography>
                          </CardContent>
                        </CardActionArea>

                        <CardActions sx={{ p: 2, pt: 0 }}>
                          {!isAdded ? (
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                                setOpen(true);
                              }}
                              sx={{
                                bgcolor: '#000000',
                                color: '#ffffff',
                                textTransform: 'none',
                                fontWeight: 600,
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
                                width: '100%',
                                bgcolor: '#f3f4f6',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                height: '36.5px',
                                overflow: 'hidden'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                onClick={(e) => { e.stopPropagation(); decreaseQty(product.id); }}
                                sx={{ minWidth: '40px', color: '#374151', fontSize: '1.25rem', fontWeight: 600 }}
                              >
                                -
                              </Button>
                              <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>
                                {qty}
                              </Typography>
                              <Button
                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                sx={{ minWidth: '40px', color: '#374151', fontSize: '1.25rem', fontWeight: 600 }}
                              >
                                +
                              </Button>
                            </Box>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Box>
      )}

      {/* Product Detail Dialog Removed (re-routed to dynamic product page) */}
    </Box>
  );
};

export default UserDashboard;