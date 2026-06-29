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
import Link from 'next/link';
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from 'next/navigation';

export default function PrimarySearchAppBar() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);
    
    const router = useRouter();

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
                    Profile
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
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                    >
                        E-Commerce
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box>
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
                    </Box>
                </Toolbar>
            </AppBar>
            {renderMenu}
        </Box>
    );
}
