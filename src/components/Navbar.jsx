import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { getCookie, deleteCookie } from '../utils/cookieAuth';

export default function Navbar({ isAdmin = false }) {
  const navigate = useNavigate();
  const studentName = getCookie('studentName');
  const username = isAdmin ? 'Admin' : studentName;

  const handleLogout = () => {
    if (isAdmin) {
      deleteCookie('adminToken');
      navigate('/admin');
    } else {
      deleteCookie('studentName');
      deleteCookie('studentSID');
      navigate('/');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          PhysicLab
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">
            Logged in as: <strong>{username}</strong>
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
