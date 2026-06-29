import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { db } from "../lib/firebase";
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import "./styles/admin.css";

const AdminDashboard = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const allUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsersList(allUsers);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRemoveUser = async (userId) => {
    if (window.confirm("Are you sure you want to remove this account?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleToggleDisable = async (userId, currentDisabledStatus) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        disabled: !currentDisabledStatus
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Box className="admin-dashboard">
        <p>Loading accounts list...</p>
      </Box>
    );
  }

  const filteredAccounts = usersList.filter((user) => {
    if (activeTab === "users") {
      return user.role === "user";
    } else {
      return user.role === "seller";
    }
  });

  return (
    <Box className="admin-dashboard">
      <h2 className="admin-title">Admin Dashboard</h2>
      
      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button 
          className={`tab-button ${activeTab === "sellers" ? "active" : ""}`}
          onClick={() => setActiveTab("sellers")}
        >
          Sellers
        </button>
      </div>

      <div className="admin-table-wrapper">
        {filteredAccounts.length === 0 ? (
          <p className="no-users-msg">No {activeTab} are currently registered.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.name || "No Name Set"}</td>
                  <td>{account.email}</td>
                  <td>
                    <span className={`status-badge ${account.disabled ? "disabled" : "active"}`}>
                      {account.disabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleToggleDisable(account.id, !!account.disabled)}
                        className={`btn-action ${account.disabled ? "btn-enable" : "btn-disable"}`}
                        type="button"
                      >
                        {account.disabled ? "Enable" : "Disable"}
                      </button>
                      <button
                        onClick={() => handleRemoveUser(account.id)}
                        className="btn-action btn-remove-user"
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
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