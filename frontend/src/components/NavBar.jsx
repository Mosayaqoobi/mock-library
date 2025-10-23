import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { toast } from "react-toastify";

const NavBar = ( { user, setUser } ) => {
  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("token");
    setUser(null);
    toast.success("Successfully Logged Out");
    navigate('/login');
  }
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a1a1a' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        
        <Button  component={Link} to="/" sx={{ color: 'white', textTransform: 'none', fontSize: '1.1rem' }}>
          Search
        </Button>


        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button component={Link} to="/my-books" startIcon={<MenuBookIcon />} sx={{ color: 'white', textTransform: 'none' }}>
            My Books
          </Button>
          
          <Button component={Link} to="/profile" startIcon={<AccountCircleIcon />} sx={{ color: 'white', textTransform: 'none' }}>
            My Profile
          </Button>
          {user && (
            <Button onClick={handleLogout} startIcon= {<LogoutIcon />} sx = {{ color: 'white', textTransform: 'none' }}>
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;