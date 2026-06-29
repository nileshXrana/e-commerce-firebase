import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "./styles/user.css";

const UserDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("show", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
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

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box className="user-dashboard">
        <p>Loading products...</p>
      </Box>
    );
  }

  return (
    <Box className="user-dashboard">
      <h2 className="user-title">Products Catalogue</h2>
      
      <div className="products-grid">
        {products.length === 0 ? (
          <p className="no-products-msg">No products are currently available.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-card-header">
                <h3 className="product-card-name">{product.name}</h3>
                <p className="product-card-description">
                  {product.description || "No description provided."}
                </p>
              </div>
              <div className="product-card-footer">
                <span className="product-card-price">${product.price ? product.price.toFixed(2) : "0.00"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Box>
  );
};

export default UserDashboard;