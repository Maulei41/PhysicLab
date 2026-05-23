import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getModuleById } from '../utils/moduleRegistry';
import NotFoundModule from './NotFoundModule';
import { AppBar, Toolbar, IconButton, Typography, Button, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ModulePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const module = getModuleById(id);

  if (!module) {
    return <NotFoundModule />;
  }

  const ModuleComponent = module.component;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}> {/* bg-slate-50 */}
      <AppBar position="static" sx={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}> {/* border-b border-slate-200 shadow-sm */}
        <Toolbar sx={{ maxWidth: '1280px', margin: '0 auto', width: '100%', paddingX: { xs: 2, sm: 3, lg: 4 }, display: 'flex', justifyContent: 'space-between' }}> {/* max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between */}
          <Button
            onClick={() => navigate('/dashboard')}
            startIcon={<ArrowBackIcon />}
            variant="contained"
            sx={{
              backgroundColor: '#e2e8f0', // bg-slate-200
              color: '#475569', // text-slate-700
              '&:hover': {
                backgroundColor: '#cbd5e1', // hover:bg-slate-300
              },
              fontWeight: 'medium', // font-medium
              fontSize: '0.875rem', // text-sm
              textTransform: 'none', // Prevent uppercase
            }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', color: '#1e293b', fontWeight: 'bold' }}> {/* text-2xl font-bold text-slate-900 */}
            {module.title}
          </Typography>
          <Box sx={{ width: '96px' }} /> {/* w-24, Spacer for alignment */}
        </Toolbar>
      </AppBar>

      <Box sx={{ paddingY: 3 }}> {/* py-6 */}
        <ModuleComponent />
      </Box>
    </Box>
  );
}
