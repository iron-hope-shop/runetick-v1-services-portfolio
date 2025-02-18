import React from 'react';
import { Box, Typography, Container, Grid, Button, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthProvider/AuthProvider';
import { useNavigate } from 'react-router-dom';

const cardStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '4px',
  backgroundColor: 'transparent',
};

const TierCard = ({ tier, isRecommended }) => (
  <Paper 
    elevation={0}
    sx={{
      ...cardStyle,
      position: 'relative',
      ...(isRecommended && { 
        borderColor: 'lime', 
        boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)' 
      })
    }}
  >
    {isRecommended && (
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: 'lime',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
        }}
      >
        Recommended
      </Box>
    )}
    <Box sx={{ p: 2, flexGrow: 1 }}>
      <Typography variant="h6" component="div" sx={{ color: 'white', mb: 1 }}>
        {tier.name}
      </Typography>
      <Typography variant="h4" component="div" sx={{ color: 'white', mb: 2 }}>
        ${tier.price}/mo
      </Typography>
      {tier.features.map((feature, index) => (
        <Typography key={index} variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
          • {feature}
        </Typography>
      ))}
    </Box>
    <Box sx={{ p: 2, mt: 'auto' }}>
      <Button 
        variant="contained" 
        fullWidth 
        sx={{ 
          bgcolor: 'lime', 
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
          color: 'white',
          textTransform: 'none',
        }}
      >
        Choose Plan
      </Button>
    </Box>
  </Paper>
);

const SubscriptionTierPage = () => {

  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate("/");
  }
  
  const tiers = [
    {
      name: 'Free Tier',
      price: 0,
      features: ['Unlimited Logging', 'Watchlist Notifications', 'Speculative Trading Tools', 'Standard Export Formats'],
    },
    {
      name: 'Quant Trader',
      price: 1.99,
      features: ['Everything included in Free Tier', 'Access to quant model', 'Basic portfolio builder', 'Model backtesting'],
      recommended: true,
    },
    {
      name: 'Pro Trader',
      price: 4.99,
      features: ['Everything included in Quant Trader', 'Advanced portfolio builder', 'Customizable quant models', 'Real-time market data'],
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#121212', mt: 8 }}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h5" component="h1" sx={{ color: 'white', mb: 1, textAlign: 'center' }}>
            Choose Your Subscription Plan
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 4, textAlign: 'center' }}>
            Pick the plan that best suits your needs.
          </Typography>
          <Grid container spacing={3}>
            {tiers.map((tier, index) => (
              <Grid item xs={12} md={4} key={index}>
                <TierCard tier={tier} isRecommended={tier.recommended} />
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default SubscriptionTierPage;