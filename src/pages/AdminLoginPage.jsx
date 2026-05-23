import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setCookie, isAdminAuthenticated } from '../utils/cookieAuth';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!username.trim()) {
      setError('Please enter username');
      return;
    }

    if (!password.trim()) {
      setError('Please enter password');
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const correctUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
      const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'physics123';

      if (username === correctUsername && password === correctPassword) {
        try {
          // Set admin token cookie
          setCookie('adminToken', 'authenticated');

          // Navigate to admin dashboard
          navigate('/admin/dashboard');
        } catch (err) {
          setError('An error occurred. Please try again.');
          setIsLoading(false);
        }
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    }, 300);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: 4 }} elevation={3}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              🔐 Admin Login
            </Typography>
            <Typography color="text.secondary">PhysicLab Administration Panel</Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              fullWidth
              autoFocus
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              fullWidth
            />

            <Button type="submit" variant="contained" disabled={isLoading} fullWidth sx={{ mt: 1 }}>
              {isLoading ? 'Authenticating...' : 'Login'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Admin credentials are required to access this panel.</Typography>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button href="/">← Back to Student Login</Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
