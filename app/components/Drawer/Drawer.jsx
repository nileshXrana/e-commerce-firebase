import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useRouter } from 'next/navigation';
import { signOut } from "firebase/auth";
import { auth } from "@/app/services/firebase.service";

export default function TemporaryDrawer() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
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

    const DrawerList = (
        <Box sx={{ width: 300, height: '100%', bgcolor: '#6f94cc2d' }} role="presentation" onClick={toggleDrawer(false)}>
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={()=>{router.push('/profile')}}>
                        <ListItemIcon>
                            <AccountCircleOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Profile" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={()=>{router.push('/cart')}}>
                        <ListItemIcon>
                            <AddShoppingCartOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="My Cart" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={()=>{router.push('/favourites')}}>
                        <ListItemIcon>
                            <FavoriteBorderOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Favourites" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={()=>{router.push('/profile')}}>
                        <ListItemIcon>
                            <SettingsOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    {auth.currentUser ? (
                        <ListItemButton onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItemButton>
                    ) : <ListItemButton onClick={()=>{router.push('/login')}}>
                            <ListItemIcon>
                                <LogoutOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText primary="Login" />
                        </ListItemButton>}
                </ListItem>
            </List>
        </Box>  
    );

    return (
        <div>
            <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="open drawer"
                sx={{ mr: 1 }}
            >
                <MenuIcon onClick={toggleDrawer(true)} />
            </IconButton>

            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </div>
    );
}
