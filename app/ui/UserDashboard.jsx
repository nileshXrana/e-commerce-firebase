import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "./styles/user.css";
import "../page.css";

const UserDashboard = () => {
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState({});
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Box className="user-dashboard">
        <p>Loading products...</p>
      </Box>
    );
  }

  return (
    <Box className="main">
      <h2 className="user-title">Products</h2>
      
      {products.length === 0 ? (
        <p className="no-products-msg">No products are currently available.</p>
      ) : (
        <Box className="outer">
          {products.map((product) => (
            <Box key={product.id} className="card">
              <Box className="image-container">
                {product.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={product.image} alt={product.name} className="image" />
                )}
              </Box>
              <Box className="card-content">
                <h2 className="title">{product.name}</h2>
                <Box className="card-detail">
                  <p className="seller-name">Seller: {sellers[product.sellerId] || "Loading..."}</p>
                  <p className="description">{product.description || "No description provided."}</p>
                  <p className="price">${product.price ? product.price.toFixed(2) : "0.00"}</p>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UserDashboard;