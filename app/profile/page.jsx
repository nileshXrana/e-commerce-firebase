"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/app/services/firebase.service";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import "./page.css";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // General info state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  // Address tab state
  const [addresses, setAddresses] = useState([]);
  const [newAddressLine, setNewAddressLine] = useState("");

  // Privacy tab state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Global loading/saving & notifications state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // types: "success", "error"
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || "");

        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setName(userData.name || "");
            setRole(userData.role || "user");
            setAddresses(userData.addresses || []);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          setMessage({ text: "Failed to load profile details.", type: "error" });
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setMessage({ text: "", type: "" });
    setNewPassword("");
    setConfirmPassword("");
    setNewAddressLine("");
  };

  // General tab: save name to firestore
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { name });
      setMessage({ text: "Profile details updated successfully!", type: "success" });
    } catch (error) {
      console.error("Error updating general profile:", error);
      setMessage({ text: "Failed to update profile. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!user || !newAddressLine.trim()) return;

    setSaving(true);
    setMessage({ text: "", type: "" });

    const newAddrObj = {
      id: "addr_" + Math.random().toString(36).substring(2, 9),
      addressLine: newAddressLine.trim(),
      isDefault: addresses.length === 0 // Default if it's their first address
    };

    const updatedAddresses = [...addresses, newAddrObj];

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      setNewAddressLine("");
      setMessage({ text: "Address added successfully!", type: "success" });
    } catch (error) {
      console.error("Error adding address:", error);
      setMessage({ text: "Failed to add address.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!user) return;

    setMessage({ text: "", type: "" });
    const targetAddress = addresses.find(addr => addr.id === id);
    let updatedAddresses = addresses.filter(addr => addr.id !== id);

    if (targetAddress?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses = updatedAddresses.map((addr, idx) =>
        idx === 0 ? { ...addr, isDefault: true } : addr
      );
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      setMessage({ text: "Address deleted successfully!", type: "success" });
    } catch (error) {
      console.error("Error deleting address:", error);
      setMessage({ text: "Failed to delete address.", type: "error" });
    }
  };

  const handleMakeDefaultAddress = async (id) => {
    if (!user) return;

    setMessage({ text: "", type: "" });
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      setMessage({ text: "Default address updated!", type: "success" });
    } catch (error) {
      console.error("Error setting default address:", error);
      setMessage({ text: "Failed to update default address.", type: "error" });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    if (newPassword !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ text: "Password must be at least 6 characters.", type: "error" });
      return;
    }

    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      await updatePassword(auth.currentUser, newPassword);
      setMessage({ text: "Password updated successfully!", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.code === "auth/requires-recent-login") {
        setMessage({
          text: "For security reasons, please log out and log back in to change your password.",
          type: "error"
        });
      } else {
        setMessage({ text: error.message || "Failed to update password.", type: "error" });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box className="profile-container">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="profile-container" sx={{ flexDirection: "column" }}>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}>
          Profile Settings
        </Typography>

        <Card sx={{ minHeight: "550px", display: "flex", flexDirection: "column", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", bgcolor: "#ffffff" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, pt: 1 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              variant="fullWidth"
            >
              <Tab label="General" value="general" />
              <Tab label="Address" value="address" />
              <Tab label="Privacy" value="privacy" />
              <Tab label="Help" value="help" />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 4, flexGrow: 1, display: "flex", flexDirection: "column" }}>
            {message.text && (
              <Alert severity={message.type === "success" ? "success" : "error"} sx={{ mb: 3 }}>
                {message.text}
              </Alert>
            )}

            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <Box component="form" onSubmit={handleSaveGeneral}>
                <Stack spacing={3}>
                  <TextField
                    label="Name"
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                  />

                  <TextField
                    label="Email address"
                    value={email}
                    disabled
                    fullWidth
                    helperText="Email address cannot be changed."
                  />

                  <TextField
                    label="Account Role"
                    value={role}
                    disabled
                    fullWidth
                    sx={{ textTransform: "capitalize" }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{
                      bgcolor: "#000000",
                      color: "#ffffff",
                      fontWeight: 600,
                      alignSelf: "flex-start",
                      px: 3,
                      py: 1,
                      textTransform: "none",
                      "&:hover": { bgcolor: "#1f2937" }
                    }}
                  >
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </Stack>
              </Box>
            )}

            {/* ADDRESS TAB */}
            {activeTab === "address" && (
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Your Addresses
                  </Typography>

                  {addresses.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      No saved addresses found. Please add an address below.
                    </Typography>
                  ) : (
                    <List sx={{ width: "100%", p: 0 }}>
                      {addresses.map((addr, index) => (
                        <ListItem
                          key={addr.id}
                          component="div"
                          sx={{
                            px: 2,
                            py: 1.5,
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            mb: index !== addresses.length - 1 ? 2 : 0,
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { xs: "flex-start", sm: "center" },
                            justifyContent: "space-between",
                            gap: 2
                          }}
                        >
                          <ListItemText
                            primary={addr.addressLine}
                            secondary={
                              addr.isDefault && (
                                <Chip component="span" label="Default" size="small" color="primary" sx={{ mt: 0.5, fontWeight: 600 }} />
                              )
                            }
                          />
                          <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}>
                            {!addr.isDefault && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleMakeDefaultAddress(addr.id)}
                                sx={{ textTransform: "none", fontWeight: 600 }}
                              >
                                Make Default
                              </Button>
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleDeleteAddress(addr.id)}
                              sx={{ textTransform: "none", fontWeight: 600 }}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>

                <Divider />

                <Box component="form" onSubmit={handleAddAddress}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Add New Address
                  </Typography>
                  <Stack spacing={2} direction={{ xs: "column", sm: "row" }} >
                    <TextField
                      label="Address details"
                      placeholder="Enter new address..."
                      value={newAddressLine}
                      onChange={(e) => setNewAddressLine(e.target.value)}
                      required
                      fullWidth
                      size="small"
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving}
                      sx={{
                        bgcolor: "#000000",
                        color: "#ffffff",
                        fontWeight: 600,
                        px: 3,
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        "&:hover": { bgcolor: "#1f2937" }
                      }}
                    >
                      Add Address
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            )}

            {/* PRIVACY TAB */}
            {activeTab === "privacy" && (
              <Box component="form" onSubmit={handleChangePassword}>
                <Stack spacing={3}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Change Password
                  </Typography>

                  <TextField
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                    required
                  />

                  <TextField
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                    required
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{
                      bgcolor: "#000000",
                      color: "#ffffff",
                      fontWeight: 600,
                      alignSelf: "flex-start",
                      px: 3,
                      py: 1,
                      textTransform: "none",
                      "&:hover": { bgcolor: "#1f2937" }
                    }}
                  >
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </Stack>
              </Box>
            )}

            {/* HELP TAB */}
            {activeTab === "help" && (
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Frequently Asked Questions (FAQ)
                </Typography>

                <Accordion sx={{ border: "1px solid #e5e7eb", boxShadow: "none", "&:before": { display: "none" }, borderRadius: "8px", overflow: "hidden" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 600 }}>How do I track my order?</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ borderTop: "1px solid #e5e7eb" }}>
                    <Typography variant="body2" color="text.secondary">
                      You can track your order status in the Order History tab on your profile dashboard (currently under construction) or by clicking the tracking link in the shipping email confirmation sent by the seller.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion sx={{ border: "1px solid #e5e7eb", boxShadow: "none", "&:before": { display: "none" }, borderRadius: "8px", overflow: "hidden" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 600 }}>What is the return policy?</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ borderTop: "1px solid #e5e7eb" }}>
                    <Typography variant="body2" color="text.secondary">
                      We offer a standard 30-day return policy on all eligible merchandise. To request a refund or return shipping label, please reach out directly to the seller of the product.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion sx={{ border: "1px solid #e5e7eb", boxShadow: "none", "&:before": { display: "none" }, borderRadius: "8px", overflow: "hidden" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 600 }}>How can I contact a seller?</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ borderTop: "1px solid #e5e7eb" }}>
                    <Typography variant="body2" color="text.secondary">
                      On the product listing page or inside your cart details, click on the seller's name to view their profile, details, or contact options.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion sx={{ border: "1px solid #e5e7eb", boxShadow: "none", "&:before": { display: "none" }, borderRadius: "8px", overflow: "hidden" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 600 }}>What payment methods are supported?</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ borderTop: "1px solid #e5e7eb" }}>
                    <Typography variant="body2" color="text.secondary">
                      We support major credit/debit cards, PayPal, Apple Pay, and Google Pay for secure checkouts. All transactions are fully encrypted.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
