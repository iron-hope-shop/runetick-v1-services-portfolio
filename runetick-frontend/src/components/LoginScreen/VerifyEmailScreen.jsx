import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  ThemeProvider,
  createTheme,
  Card,
  CardContent,
  Snackbar,
  Alert
} from '@mui/material';
import { useAuth } from '../AuthProvider/AuthProvider';
import DynamicBackground from './DynamicBackground';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#fff' },
    secondary: { main: '#fff' },
    background: { default: '#121212', paper: 'rgba(30, 30, 30, 0.1)' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const VerifyEmailScreen = () => {
  const [verificationStatus, setVerificationStatus] = useState('Verifying...');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const verifyEmailToken = async () => {
      const urlParams = new URLSearchParams(location.search);
      const oobCode = urlParams.get('oobCode');

      if (oobCode) {
        try {
          await verifyEmail(oobCode);
          setVerificationStatus('Email verified successfully!');
        } catch (error) {
          console.error('Error verifying email:', error);
          setError('Failed to verify email. The link may be invalid or expired.');
        }
      } else {
        setError('Invalid verification link.');
      }
    };

    verifyEmailToken();
  }, [location, verifyEmail]);

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          backgroundColor: '#121212',
        }}
      >
        <DynamicBackground />
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}
        >
          <Card 
            sx={{ 
              maxWidth: 400, 
              width: '100%', 
              m: 2, 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Typography variant="h4" component="h1" color="text.primary" gutterBottom>
                Email Verification
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {verificationStatus}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{
                  mt: 3,
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.23)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    backgroundColor: 'lime',
                  }
                }}
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </Box>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default VerifyEmailScreen;