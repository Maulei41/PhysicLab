import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

export default function PlaceholderModule() {
  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
      <Paper sx={{ p: 8, textAlign: 'center', maxWidth: 560 }} elevation={3}>
        <Typography variant="h1" component="div" sx={{ fontSize: 64 }} gutterBottom>
          🔬
        </Typography>
        <Typography variant="h4" gutterBottom>
          Module Coming Soon
        </Typography>
        <Typography color="text.secondary">
          This physics simulation module is under development. Check back soon!
        </Typography>
      </Paper>
    </Box>
  );
}
