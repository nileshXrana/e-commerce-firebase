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
import { db, auth } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useRouter } from 'next/navigation';

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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [now, setNow] = useState(new Date());

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

  // Update "details of now" clock when modal is open
  useEffect(() => {
    if (!selectedProduct) return;
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedProduct]);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const addToCart = (product) => {
    if (!auth.currentUser) {
      router.push("/login");
      return;
    }
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
    if (!auth.currentUser) {
      router.push("/login");
      return;
    }
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

  // Find currently active product details (to reactively sync cart counts inside dialog)
  const activeProductInDialog = selectedProduct 
    ? (products.find(p => p.id === selectedProduct.id) || selectedProduct)
    : null;

  const dialogCartItem = activeProductInDialog ? cart.find(item => item.id === activeProductInDialog.id) : null;
  const isDialogItemAdded = !!dialogCartItem;
  const dialogQty = dialogCartItem ? dialogCartItem.quantity : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1400px', mx: 'auto' }}>
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
        <Typography 
          variant="body1" 
          sx={{ textAlign: 'center', color: 'text.secondary', py: 8, fontStyle: 'italic' }}
        >
          No products are currently available.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => {
            const cartItem = cart.find(item => item.id === product.id);
            const isAdded = !!cartItem;
            const qty = cartItem ? cartItem.quantity : 0;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product.id} sx={{ display: 'flex' }}>
                <Card 
                  sx={{ 
                    width: '100%',
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardActionArea 
                    onClick={() => setSelectedProduct(product)}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    {product.images && product.images.length > 0 ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.images[0]}
                        alt={product.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ height: 200, bgcolor: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">No Image</Typography>
                      </Box>
                    )}
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

      {/* Product Detail Dialog */}
      <Dialog
        open={Boolean(activeProductInDialog)}
        onClose={() => setSelectedProduct(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '12px', overflow: 'hidden' }
        }}
      >
        {activeProductInDialog && (
          <>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Product Details</Typography>
              <IconButton
                aria-label="close"
                onClick={() => setSelectedProduct(null)}
                sx={{ color: 'text.secondary' }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  {activeProductInDialog.images && activeProductInDialog.images.length > 0 ? (
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: { xs: '250px', md: '350px' }, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        bgcolor: '#f8fafc', 
                        borderRadius: '8px', 
                        overflow: 'hidden', 
                        border: '1px solid #e5e7eb' 
                      }}
                    >
                      <img
                        src={activeProductInDialog.images[0]} 
                        alt={activeProductInDialog.name} 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', height: { xs: '250px', md: '350px' }, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <Typography color="text.secondary">No Image Available</Typography>
                    </Box>
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                      {activeProductInDialog.name}
                    </Typography>
                    <Typography variant="body2" sx={{ textTransform: 'uppercase', fontWeight: 600, color: 'text.secondary', letterSpacing: '0.05em' }}>
                      Seller: {sellers[activeProductInDialog.sellerId] || "Unknown Seller"}
                    </Typography>
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0284c7' }}>
                    ${activeProductInDialog.price ? activeProductInDialog.price.toFixed(2) : "0.00"}
                  </Typography>

                  <Typography variant="body1" sx={{ color: '#4b5563', lineHeight: 1.6 }}>
                    {activeProductInDialog.description || "No description provided."}
                  </Typography>

                  <Box sx={{ mt: 'auto', p: 2.5, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1f2937' }}>
                      Details of Now
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      As of: {now.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </Typography>
                    
                    {!isDialogItemAdded ? (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          addToCart(activeProductInDialog);
                          setOpen(true);
                        }}
                        sx={{ 
                          bgcolor: '#000000', 
                          color: '#ffffff', 
                          textTransform: 'none', 
                          fontWeight: 600,
                          py: 1,
                          '&:hover': { bgcolor: '#1f2937' }
                        }}
                      >
                        Add to Cart
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px', height: '40px', overflow: 'hidden' }}>
                        <Button 
                          onClick={() => decreaseQty(activeProductInDialog.id)}
                          sx={{ minWidth: '50px', color: '#374151', fontSize: '1.25rem', fontWeight: 600, height: '100%' }}
                        >
                          -
                        </Button>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
                          {dialogQty}
                        </Typography>
                        <Button 
                          onClick={() => addToCart(activeProductInDialog)}
                          sx={{ minWidth: '50px', color: '#374151', fontSize: '1.25rem', fontWeight: 600, height: '100%' }}
                        >
                          +
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default UserDashboard;