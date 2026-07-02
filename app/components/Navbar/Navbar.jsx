"use client";
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Badge from '@mui/material/Badge';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Link from 'next/link';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/services/firebase.service";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from 'next/navigation';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export default function PrimarySearchAppBar() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const [user, setUser] = React.useState(null);
    const [role, setRole] = React.useState(null);
    const [cartCount, setCartCount] = React.useState(0);
    const [searchInput, setSearchInput] = React.useState("");

    React.useEffect(() => {
        const handleClear = () => {
            setSearchInput("");
        };
        window.addEventListener("clearDashboardSearch", handleClear);
        return () => window.removeEventListener("clearDashboardSearch", handleClear);
    }, []);

    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        window.dispatchEvent(new CustomEvent("dashboardSearch", { detail: value }));
    };

    const handleSearchClear = () => {
        setSearchInput("");
        window.dispatchEvent(new CustomEvent("dashboardSearch", { detail: "" }));
    };

    React.useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                const total = parsed.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(total);
            } catch (error) {
                console.error("Error parsing cart data:", error);
            }
        }
    }, []);

    const router = useRouter();
    const pathname = usePathname();

    React.useEffect(() => {
        const updateCount = () => {
            const savedCart = localStorage.getItem("cart");
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                const count = parsed.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(count);
            } else {
                setCartCount(0);
            }
        };

        window.addEventListener("cartUpdated", updateCount);
        return () => window.removeEventListener("cartUpdated", updateCount);
    }, []);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setRole(userDocSnap.data().role || "user");
                    } else {
                        setRole("user");
                    }
                } catch (error) {
                    console.error("Error fetching user role in navbar:", error);
                    setRole("user");
                }
            } else {
                setRole("Guest / Logged Out");
            }
        });
        return () => unsubscribe();
    }, []);

    const handleToggleFilterDrawer = () => {
        window.dispatchEvent(new Event("toggleFilterSidebar"));
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                console.log("User logged out");
                router.push("/");
            })
            .catch((error) => {
                console.error("Logout failed", error);
            });
    };

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleMenuClose}>
                <Link href="/profile" style={{ textDecoration: 'none', color: 'inherit', width: '100%', display: 'block' }}>
                    Setting
                </Link>
            </MenuItem>
            <MenuItem onClick={() => {
                handleMenuClose();
                handleLogout();
            }}>
                Logout
            </MenuItem>
        </Menu>
    );

    return (
        <Box sx={{
            flexGrow: 1,
            position: 'sticky',
            top: 0,
            height: 'fit-content',
            bgcolor: 'background.paper',
            zIndex: 10
        }}>
            <AppBar position="static" sx={{bgcolor: '#000000e8'}}>
                <Toolbar>
                    {pathname === '/dashboard' && (role === 'user' || role === 'Guest / Logged Out' || !role) && (
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="open filters"
                            onClick={handleToggleFilterDrawer}
                            sx={{ mr: 1, display: { xs: 'block', md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                    >
                        <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
                            E-Commerce
                        </Link>
                    </Typography>
                    {pathname === '/dashboard' && (role === 'user' || role === 'Guest / Logged Out' || !role) && (
                        <Box sx={{ 
                            flexGrow: 1, 
                            display: 'flex', 
                            justifyContent: 'center', 
                            mx: { xs: 1, sm: 4 },
                            maxWidth: { xs: 150, sm: 300, md: 500 },
                            width: '100%'
                        }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search products..."
                                value={searchInput}
                                onChange={handleSearchInputChange}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchInput && (
                                            <InputAdornment position="end">
                                                <ClearIcon
                                                    fontSize="small"
                                                    style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}
                                                    onClick={handleSearchClear}
                                                />
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            color: 'white',
                                            bgcolor: 'rgba(255, 255, 255, 0.15)',
                                            borderRadius: '20px',
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 255, 255, 0.25)',
                                            },
                                            '&.Mui-focused': {
                                                bgcolor: 'rgba(255, 255, 255, 0.25)',
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 'none',
                                            },
                                            px: 1,
                                        }
                                    }
                                }}
                            />
                        </Box>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            size="large"
                            color="inherit"
                            onClick={() => router.push("/cart")}
                            aria-label="show cart items"
                        >
                            <Badge badgeContent={cartCount} color="error">
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>
                        {user && (
                            <IconButton
                                size="large"
                                edge="end"
                                aria-label="account of current user"
                                aria-controls={menuId}
                                aria-haspopup="true"
                                onClick={handleProfileMenuOpen}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            {renderMenu}
        </Box>
    );
}
