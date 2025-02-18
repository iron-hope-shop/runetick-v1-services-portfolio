import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Link,
  InputAdornment,
  ThemeProvider,
  Snackbar,
  Alert,
  createTheme
} from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import { useAuth } from '../AuthProvider/AuthProvider';
import DynamicBackground from './DynamicBackground';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#fff' },
    secondary: { main: '#fff' },
    background: { default: '#121212', paper: 'rgba(30, 30, 30, 0.1)' },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#fff',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          '&::before, &::after': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
        },
      },
    },
  },
});

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [captchaToken, setCaptchaToken] = useState('');
  const recaptchaRef = useRef(null);

  const handleRecaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const navigateToLogin = (event) => {
    event.preventDefault();
    navigate('/');
  };

  const clearPasswords = () => {
    setPassword('');
    setConfirmPassword('');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      clearPasswords();
      return;
    }
    try {
      const result = await signUp(email, password);
      if (result.success) {
        setMessage('Account created successfully. Please check your email to verify your account.');
        clearPasswords();
        navigate('/', { state: { message: 'Please verify your email before logging in.' } })
      }
    } catch (error) {
      console.error("Error signing up", error);
      setError(error.message);
    } finally {
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken('');
      clearPasswords();
    }
  };

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
                Sign Up
              </Typography>
              <Box component="form" onSubmit={handleSignUp} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                />

                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LfCrBwqAAAAANSDlARUovKJAfQdvKhCC9-_uMz0"
                  onChange={handleRecaptchaChange}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={!captchaToken}
                  sx={{
                    mt: 3,
                    mb: 2,
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.23)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      backgroundColor: 'lime',
                    }
                  }}
                >
                  Sign Up
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" align="center">
                Already have an account?{' '}
                <Link href="#" onClick={navigateToLogin} variant="body2" sx={{ color: 'lime' }}>
                  Sign in
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage('')}>
          <Alert onClose={() => setMessage('')} severity="success" sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default SignUpScreen;