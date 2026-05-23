import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setCookie, isStudentAuthenticated } from '../utils/cookieAuth';
import { recordStudentLogin } from '../utils/studentTracker';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

export default function StudentLoginPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [sid, setSid] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isStudentAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!sid.trim()) {
      setError('Please enter your SID');
      return;
    }

    setIsLoading(true);

    // Simulate slight delay for better UX
    setTimeout(() => {
      try {
        // Set cookies
        setCookie('studentName', name.trim());
        setCookie('studentSID', sid.trim());

        // Record login in localStorage
        recordStudentLogin(name.trim(), sid.trim());

        // Navigate to dashboard
        navigate('/dashboard');
      } catch (err) {
        setError('An error occurred. Please try again.');
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
              PhysicLab
            </Typography>
            <Typography color="text.secondary">Student Physics Simulations</Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              fullWidth
              autoFocus
            />

            <TextField
              label="Student ID (SID)"
              value={sid}
              onChange={(e) => setSid(e.target.value)}
              disabled={isLoading}
              fullWidth
            />

            <Button type="submit" variant="contained" disabled={isLoading} fullWidth sx={{ mt: 1 }}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Your information is stored locally in cookies for this session only.</Typography>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button href="/admin">Admin Login</Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
