import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Link,
  InputAdornment,
  Divider,
  createTheme,
  ThemeProvider,
  Snackbar,
  Alert
} from '@mui/material';
import { Email, Lock, Google as GoogleIcon, GitHub as GitHubIcon, Microsoft as MicrosoftIcon } from '@mui/icons-material';
import { useAuth } from '../AuthProvider/AuthProvider';
import DynamicBackground from './DynamicBackground';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";

const getRandomWord = () => {
  const words = ["💎 hands!", "ruuun!", "asdfgh", "99 HP!", "1337!", "tele me!", "bank sale!", "Hop pls", "R.I.P.", "gz!", "lobsters!", "rock crabs", "QWERTY", "Stonks 📈"];
  return words[Math.floor(Math.random() * words.length)];
};

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

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { signInWithEmail, signInWithGoogle, signInWithGitHub, signInWithMicrosoft, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [randomWord, setRandomWord] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [recaptchaCompleted, setRecaptchaCompleted] = useState(false);
  const recaptchaRef = useRef(null);

  const handleRecaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  useEffect(() => {
    setRandomWord(getRandomWord());
  }, []);

  const navigateToSignup = (event) => {
    event.preventDefault();
    navigate('/signup');
  };

  const navigateToReset = (event) => {
    event.preventDefault();
    navigate('/reset');
  };

  const handleEmailPasswordSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      if (error.message.includes('Please verify your email before signing in.')) {
        setError('Please verify your email before signing in. Check your inbox or spam folder.');
      } else {
        setError(error.message);
      }
    } finally {
      setPassword(''); // Clear the password field

      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setRecaptchaCompleted(false);
      setCaptchaToken('');
    }
  };


  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      setError(`Error signing in with Google: ${error.message}`);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      await signInWithGitHub();
    } catch (error) {
      setError(`Error signing in with GitHub: ${error.message}`);
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      await signInWithMicrosoft();
    } catch (error) {
      setError(`Error signing in with Microsoft: ${error.message}`);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      setMessage('Verification email sent. Please check your inbox.');
    } catch (error) {
      setError(`Error sending verification email: ${error.message}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && recaptchaCompleted) {
      handleEmailPasswordSignIn(e);
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
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Typography variant="h3" component="h1" color="text.primary" gutterBottom>
                  runetick
                </Typography>
                <span style={{
                  display: 'inline-block',
                  transform: 'rotate(-45deg)',
                  color: 'lime',
                  fontSize: 12,
                  position: 'absolute',
                  bottom: '12px',
                  right: '-28px',
                  zIndex: 2
                }}>
                  {randomWord}
                </span>
              </Box>
              <Box component="form" onSubmit={handleEmailPasswordSignIn} sx={{ mt: 1, width: '100%' }}>
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
                  onKeyPress={handleKeyPress}
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                />
                {error && error.includes('verify your email') && (
                  <Button
                    onClick={handleResendVerification}
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 2,
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
                    Resend Verification Email
                  </Button>
                )}
                <ReCAPTCHA
                  ref={recaptchaRef}

                  sitekey="6LfCrBwqAAAAANSDlARUovKJAfQdvKhCC9-_uMz0"
                  onChange={() => setRecaptchaCompleted(true)}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={!recaptchaCompleted}
                  sx={{
                    mt: 2,
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
                  Sign In
                </Button>

              </Box>
              <Divider sx={{ width: '100%', mb: 2 }}>SSO</Divider>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                  mb: 2,
                  color: '#ffffff',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    backgroundColor: 'lime',
                  }
                }}
              >
                Sign in with Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GitHubIcon />}
                onClick={handleGitHubSignIn}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                  mb: 2,
                  color: '#ffffff',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    backgroundColor: 'lime',
                  }
                }}
              >
                Sign in with GitHub
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<MicrosoftIcon />}
                onClick={handleMicrosoftSignIn}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                  mb: 2,
                  color: '#ffffff',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    backgroundColor: 'lime',
                  }
                }}
              >
                Sign in with Microsoft
              </Button>
              <Typography variant="body2" color="text.secondary" align="center">
                Don't have an account?{' '}
                <Link href="#" onClick={navigateToSignup} variant="body2" sx={{ color: 'lime' }}>
                  Sign up
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, mb: 2 }}>
                <Link href="#" onClick={navigateToReset} variant="body2" sx={{ color: 'lime' }}>
                  Forgot password?
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Problems? Join the Runetick {' '}
                <a
                  href="https://discord.gg/pY4KVd9MjR"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'lime' }}
                >
                  Discord
                </a>.
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
        <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage('')}>
          <Alert onClose={() => setMessage('')} severity="success" sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default LoginScreen;