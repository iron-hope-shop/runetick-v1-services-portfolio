import React, { useEffect, useState, useRef } from 'react';
import { Box, Button } from '@mui/material';
import { useAuth } from '../AuthProvider/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import ReCAPTCHA from "react-google-recaptcha";

const cardStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '4px',
  backgroundColor: 'transparent',
  margin: 'auto',
  mt: 10,
  maxWidth: "200px"
};

const SettingsPage = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [captchaToken, setCaptchaToken] = useState('');
  const recaptchaRef = useRef(null);

  const handleRecaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleResetPassword = async (email) => {
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent!');
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken('');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      alert('Error sending password reset email. Please try again.');
    }
  };

  const isEmailUser = user && user.email;

  return (
    <Box sx={cardStyle}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey="6LfCrBwqAAAAANSDlARUovKJAfQdvKhCC9-_uMz0"
        onChange={handleRecaptchaChange}
      />
      {isEmailUser && (
        <Button
          onClick={() => handleResetPassword(user.email)}
          disabled={!captchaToken}
        >
          Reset Password
        </Button>
      )}
      <Button onClick={logout}>LOG OUT</Button>
    </Box>
  );
};

export default SettingsPage;