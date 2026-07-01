import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { db } from "@/app/services/firebase.service";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import "./SellerDashboard.css";
import UploadButton from './components/UploadButton/UploadButton';

const SellerDashboard = ({ sellerId }) => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [show, setShow] = useState(true);
  const [activeTab, setActiveTab] = useState("productList");
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!sellerId) return;

    const q = query(
      collection(db, "products"),
      where("sellerId", "==", sellerId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsList);
    });

    return () => unsubscribe();
  }, [sellerId]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !sellerId) return;

    try {
      await addDoc(collection(db, "products"), {
        name,
        price: parseFloat(price),
        description,
        show,
        sellerId,
        createdAt: new Date(),
        images: images || [],
      });

      // Reset form
      setName("");
      setPrice("");
      setDescription("");
      setShow(true);
      setActiveTab("productList");
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", productId));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleToggleShow = async (productId, currentShowValue) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        show: !currentShowValue,
      });
    } catch (error) {
      console.error("Error updating product visibility:", error);
    }
  };

  return (
    <Box className="seller-dashboard">
      <h2 className="seller-title">Seller Dashboard</h2>

      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "productList" ? "active" : ""}`}
          onClick={() => setActiveTab("productList")}
          type="button"
        >
          Product List
        </button>
        <button
          className={`tab-button ${activeTab === "addProduct" ? "active" : ""}`}
          onClick={() => setActiveTab("addProduct")}
          type="button"
        >
          Add Product
        </button>
      </div>

      {activeTab === "addProduct" && (
        <form onSubmit={handleAddProduct} className="add-product-form">
          <h3 style={{ margin: "0 0 1rem 0" }}>Add New Product</h3>
          <Box className="form-row">
            <Box className="form-group-item">
              <label htmlFor="image">Upload Image</label>
              <UploadButton
                signatureEndpoint="/api/sign-cloudinary-params"
                className="seller-input"
                onSuccess={(result) => {
                  // append the uploaded image URL
                  setImages([...images, result.info.secure_url]);
                }}
              />
            </Box>
            <Box className="form-group-item">
              <label htmlFor="prod-name">Product Name</label>
              <input
                id="prod-name"
                type="text"
                className="seller-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. T-Shirt"
                required
              />
            </Box>
            <Box className="form-group-item">
              <label htmlFor="prod-price">Price ($)</label>
              <input
                id="prod-price"
                type="number"
                step="0.01"
                className="seller-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 19.99"
                required
              />
            </Box>
          </Box>

          <Box className="form-row">
            <Box className="form-group-item" style={{ flex: 2 }}>
              <label htmlFor="prod-desc">Description</label>
              <textarea
                id="prod-desc"
                className="seller-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product details..."
                rows={3}
              />
            </Box>
            <Box className="form-group-item">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={show}
                  onChange={(e) => setShow(e.target.checked)}
                />
                Show to buyers
              </label>
            </Box>
          </Box>

          <button type="submit" className="btn-add-product">
            Add Product
          </button>
        </form>
      )}

      {activeTab === "productList" && (
        <Box className="products-table-wrapper">
          {products.length === 0 ? (
            <p className="no-products-msg">No products added yet.</p>
          ) : (
            <table className="product-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th style={{ textAlign: "center" }}>Show to Buyers</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td className="price-col">${product.price.toFixed(2)}</td>
                    <td>{product.description || "-"}</td>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={product.show ?? true}
                        onChange={() => handleToggleShow(product.id, product.show ?? true)}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="btn-delete-product"
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Box>
      )}
    </Box>
  );
}

export default SellerDashboard;