import React from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useLiveStatus } from '../Hooks/useLiveStatus';
import { Link, useNavigate, } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

const RunetickLogo = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isLive } = useLiveStatus();
  const navigate = useNavigate();

  const navigateHome = (event) => {
    event.preventDefault();
    navigate('/home');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': { transform: 'scale(1.1)' },
        cursor: 'pointer',
      }}
      onClick={navigateHome}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 0.5
          }}
        >

          <Box
            sx={{
              position: 'relative',
              width: 24,
              height: 24,
              mr: 0.5,
              mb: 0.25,
              userSelect: 'none', // Disable text selection
              cursor: 'pointer', // Change cursor to pointer to indicate clickability
            }}
            onClick={navigateHome} // Add your click handler here
          >
            <Box
              component="img"
              src="/spinicon.png"
              alt="Favicon"
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                // boxShadow: isLive ? '0 0 2px 2px lime' : '0 0 5px 5px red',
                animation: 'rotate-animation 8s infinite linear, blink-animation 4s infinite ease-in-out',
                '@keyframes rotate-animation': {
                  '0%': { transform: 'rotate(0deg)' },
                  '25%': { transform: 'rotate(180deg)' },
                  '50%': { transform: 'rotate(180deg)' },
                  '75%': { transform: 'rotate(360deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                },
                '@keyframes blink-animation': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0 },
                  '100%': { opacity: 1 }
                }
              }}
            />
            <Box
              component="img"
              src="/spinicon_overlay.png" // Replace with the path to your overlay image
              alt="Overlay"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                pointerEvents: 'none' // Ensure the overlay image doesn't interfere with interactions
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ userSelect: 'none', fontSize: '12', color: isLive ? 'lime' : 'red' }}>
            {isLive ? 'LIVE' : 'OFF'}
          </Typography>
        </Box>
      </Box>
      {/* {!isMobile && (
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 'bold',
          }}
        >
          runetick
        </Typography>
      )} */}
    </Box>
  );
};

export default RunetickLogo;