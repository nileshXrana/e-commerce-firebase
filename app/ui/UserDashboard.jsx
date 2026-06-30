import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { db, auth } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import "./styles/user.css";
import "../page.css";
import Image from 'next/image';
import RotateRightIcon from '@mui/icons-material/RotateRight';

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

  useEffect(() => {
    // Subscribe to all users to map sellerId to seller name
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
      <Box className="user-dashboard">
        <RotateRightIcon className="infiniteLoader"/>
      </Box>
    );
  }

  return (
    <Box className="main">
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
        <p className="no-products-msg">No products are currently available.</p>
      ) : (
        <Box className="outer">
          {products.map((product) => {
            const cartItem = cart.find(item => item.id === product.id);
            const isAdded = !!cartItem;
            const qty = cartItem ? cartItem.quantity : 0;

            return (
              <Box key={product.id} className="card">
                <div className="image-container">
                  {product.images && product.images.length > 0 && ( 
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={325}
                      height={210}
                    />
                  )}
                </div>
                <Box className="card-content">
                  <h2 className="title">{product.name}</h2>
                  <Box className="card-detail">
                    <p className="seller-name">Seller: {sellers[product.sellerId] || "Loading..."}</p>
                    <p className="description">{product.description || "No description provided."}</p>
                    <p className="price">${product.price ? product.price.toFixed(2) : "0.00"}</p>
                    
                    {!isAdded ? (
                      <div>
                        <Button
                          className="addtocart block"
                          variant="contained"
                          onClick={() => {
                            addToCart(product);
                            setOpen(true);
                          }}
                          style={{ width: '100%', marginTop: '0.75rem' }}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    ) : (
                      <Box className="qty-selector" style={{ marginTop: '0.75rem' }}>
                        <button
                          className="qty-btn"
                          onClick={() => decreaseQty(product.id)}
                          type="button"
                        >
                          -
                        </button>
                        <span className="qty-text">{qty}</span>
                        <button
                          className="qty-btn"
                          onClick={() => addToCart(product)}
                          type="button"
                        >
                          +
                        </button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default UserDashboard;