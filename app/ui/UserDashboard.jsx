import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "./styles/user.css";
import "../page.css";

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
      <h2 className="user-title">Products</h2>
      
      <div className="products-grid">
        {products.length === 0 ? (
          <p className="no-products-msg">No products are currently available.</p>
        ) : (
          <Box className="main">
          <Box className="outer">
            {products.map((product) => {
              // const cartItem = cart.find(item => item.id === product.id);
              // const isAdded = !!cartItem;
              // const qty = cartItem ? cartItem.quantity : 0;

              return (
                <Box key={product.id} className="card">
                  {/* <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    open={open}
                    autoHideDuration={2000}
                    onClose={handleClose}
                    message="Item Added"
                    action={action}
                  /> */}
                  {/* <Box className="image-container">
                    <Image src={product.image} alt={product.title} width={150} height={150}
                      className="image" />
                  </Box> */}
                  <Box className="card-content">
                    <h2 className="title">{product.name}</h2>
                    <Box className="card-detail">
                      <p>{product.description}</p>
                      <p className="price">${product.price.toFixed(2)}</p>

                      {/* {!isAdded ? (
                        <div>
                          <Button
                            className="addtocart block"
                            variant="contained"
                            onClick={() => {
                              addToCart(product);
                              handleClick();
                            }}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      ) : (
                        <Box className="qty-selector">
                          <div>
                            <button
                              className="qty-btn"
                              onClick={() => {
                                decreaseQty(product.id)
                              }}
                              disabled={qty === 0}
                            >
                              -
                            </button>
                          </div>
                          <span className="qty-text">{qty}</span>
                          <button
                            className="qty-btn"
                            onClick={() => {
                              addToCart(product);
                            }}
                          >
                            +
                          </button>
                        </Box>
                      )} */}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Pagination */}
          {/* {totalPages > 1 && (
            <Box className="pagination-container">
              <Button
                variant="outlined"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
                className="page-btn"
              >
                &lt;
              </Button>

              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outlined"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                &gt;
              </Button>
            </Box>
          )} */}
        </Box>

          // products.map((product) => (
          //   <div key={product.id} className="product-card">
          //     <div className="product-card-header">
          //       <h3 className="product-card-name">{product.name}</h3>
          //       <p className="product-card-description">
          //         {product.description || "No description provided."}
          //       </p>
          //     </div>
          //     <div className="product-card-footer">
          //       <span className="product-card-price">${product.price ? product.price.toFixed(2) : "0.00"}</span>
          //     </div>
          //   </div>
          // ))
        )}
      </div>
    </Box>
  );
};

export default UserDashboard;