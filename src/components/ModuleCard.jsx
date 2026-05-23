import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function ModuleCard({ id, title }) {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate(`/module/${id}`);
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 200,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1,
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontSize: '3rem' }}>
          🔬
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          {title}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={handleEnter}
        >
          Enter Module
        </Button>
      </CardActions>
    </Card>
  );
}
