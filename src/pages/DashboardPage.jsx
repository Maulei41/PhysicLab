import React from 'react';
import { getCookie } from '../utils/cookieAuth';
import { modules } from '../utils/moduleRegistry';
import Navbar from '../components/Navbar';
import ModuleCard from '../components/ModuleCard';
import { Box, Container, Typography, Grid } from '@mui/material';

export default function DashboardPage() {
  const studentName = getCookie('studentName');

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <Navbar isAdmin={false} />

      <Container maxWidth="lg" sx={{ paddingY: 12 }}>
        {/* Header */}
        <Box sx={{ marginBottom: 12 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: '#1e293b', marginBottom: 1 }}>
            Welcome, <Typography component="span" sx={{ color: '#2563eb' }}>{studentName}</Typography>!
          </Typography>
          <Typography variant="h6" sx={{ color: '#475569' }}>
            Select a module below to start exploring physics simulations.
          </Typography>
        </Box>

        {/* Modules Grid */}
        <Grid container spacing={3}>
          {modules.map((module) => (
            <Grid item xs={12} sm={6} md={3} key={module.id}>
              <ModuleCard
                id={module.id}
                title={module.title}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
