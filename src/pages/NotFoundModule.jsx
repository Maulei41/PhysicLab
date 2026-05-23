import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Box, Container, Typography, Button } from '@mui/material';

export default function NotFoundModule() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar isAdmin={false} />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h1" sx={{ fontSize: 64 }} gutterBottom>❌</Typography>
          <Typography variant="h4" gutterBottom>Module Not Found</Typography>
          <Typography sx={{ maxWidth: 640, mx: 'auto', color: 'text.secondary', mb: 3 }}>
            The module you're looking for doesn't exist or has been moved. Please return to the dashboard to select a valid module.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>← Back to Dashboard</Button>
        </Box>
      </Container>
    </Box>
  );
}
