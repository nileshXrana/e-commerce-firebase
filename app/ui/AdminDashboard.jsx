import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { db } from "../lib/firebase";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import "./styles/admin.css";

const AdminDashboard = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const allUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsersList(allUsers);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users list:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRemoveUser = async (userId) => {
    if (window.confirm("Are you sure you want to remove this account?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
      } catch (error) {
        console.error("Error deleting user document:", error);
      }
    }
  };

  if (loading) {
    return (
      <Box className="admin-dashboard">
        <p>Loading accounts list...</p>
      </Box>
    );
  }

  // Admin manages only 'user' and 'seller' roles
  const managedAccounts = usersList.filter((user) => user.role === "user" || user.role === "seller");

  return (
    <Box className="admin-dashboard">
      <h2 className="admin-title">Admin Dashboard</h2>
      <h3 className="admin-subtitle">Manage Users & Sellers</h3>

      <div className="admin-table-wrapper">
        {managedAccounts.length === 0 ? (
          <p className="no-users-msg">No buyers or sellers are currently registered.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Account Role</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {managedAccounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.name || "No Name Set"}</td>
                  <td>{account.email}</td>
                  <td>
                    <span className={`role-badge ${account.role}`}>
                      {account.role}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => handleRemoveUser(account.id)}
                      className="btn-remove-user"
                      type="button"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Box>
  );
};

export default AdminDashboard;