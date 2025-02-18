import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Snackbar, Link } from '@mui/material';
import { useAuth } from '../AuthProvider/AuthProvider';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const ClosedBetaRegistration = () => {
  const [emailOrDiscord, setEmailOrDiscord] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = await getToken();
    if (!token) {
      setSnackbarMessage('Authentication token is missing');
      setSnackbarOpen(true);
      return;
    }

    const uid = 'user123'; // Replace with actual user ID logic

    try {
      const response = await fetch(`${API_URL}/users/join-beta`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });

      if (response.ok) {
        setSnackbarMessage('User added to beta list');
      } else {
        const errorData = await response.json();
        setSnackbarMessage(errorData.error || 'Failed to add user to beta list');
      }
    } catch (error) {
      console.error('Error adding user to beta list:', error);
      setSnackbarMessage('Failed to add user to beta list');
    }

    setSnackbarOpen(true);
    navigate(`/home`);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: 'calc(100vh - 64px)', 
      padding: 3,
      backgroundColor: '#121212',
      color: 'white'
    }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Register for Closed Beta
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
        <TextField
          fullWidth
          label="Email"
          value={emailOrDiscord}
          onChange={(e) => setEmailOrDiscord(e.target.value)}
          margin="normal"
          required
          sx={{ 
            '& .MuiInputBase-input': { color: 'white' },
            '& .MuiInputLabel-root': { color: 'white' },
            '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' } }
          }}
        />
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'rgba(255, 255, 255, 0.7)' }}>
          You must be a member of our{' '}
          <Link href="https://discord.gg/cActgyWvrA" target="_blank" rel="noopener noreferrer" sx={{ color: '#dfb19f' }}>
            Discord server
          </Link>{' '}
          to participate in the closed beta.
        </Typography>
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          sx={{ mt: 3, mb: 2 }}
        >
          Register
        </Button>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default ClosedBetaRegistration;