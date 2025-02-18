import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ScienceIcon from '@mui/icons-material/Science';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SearchBar from '../SearchBar/SearchBar';
import OnboardingModal from '../OnboardingModal/OnboardingModal';
import RunetickLogo from '../RunetickLogo/RunetickLogo';
import { useNavigate } from 'react-router-dom';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const ResponsiveAppBar = ({
  toggleDrawer
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const navigate = useNavigate();

  const navigateToHome = (event) => {
    event.preventDefault();
    navigate('/home');
    handleMenuClose();
  };

  const navigateToSettings = (event) => {
    event.preventDefault();
    navigate('/settings');
    handleMenuClose();
  };

  const navigateToBeta = (event) => {
    event.preventDefault();
    navigate('/beta');
    handleMenuClose();
  };

  const navigateToSims = (event) => {
    event.preventDefault();
    navigate('/trading-sims');
    handleMenuClose();
  };

  const navigateToSub = (event) => {
    event.preventDefault();
    navigate('/subscriptions');
    handleMenuClose();
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenOnboarding = () => {
    setIsOnboardingOpen(true);
    handleMenuClose();
  };


  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: 'transparent',
          boxShadow: 'none',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          zIndex: 10
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', position: 'relative', height: 64 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', position: 'absolute', left: 0 }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ ml: 1 }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>

            <RunetickLogo />
          </Box>

          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              [theme.breakpoints.down('sm')]: {
                left: 'auto',
                right: 48,
                transform: 'none',
              }
            }}
          >
            <SearchBar />
          </Box>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            position: 'absolute',
            right: 0,
          }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuClick}
              color="inherit"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  background: 'rgba(18, 18, 18, 0.8)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  width: '260px',
                  overflow: 'visible',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'rgba(18, 18, 18, 0.8)',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderBottom: 'none',
                    borderRight: 'none',
                  },
                },
              }}
            >
              <MenuItem
                onClick={navigateToHome}
                sx={{
                  py: 1,
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <HomeIcon sx={{ mr: 2, color: 'white' }} />
                  <Typography variant="subtitle2" sx={{ color: 'white' }}>Home</Typography>
                </Box>
              </MenuItem>
              {/* <MenuItem
                onClick={() => {
                  handleOpenOnboarding();
                  handleMenuClose();
                }}
                sx={{
                  py: 1,
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <SchoolIcon sx={{ mr: 2, color: 'white' }} />
                  <Typography variant="subtitle2" sx={{ color: 'white' }}>Tutorials</Typography>
                </Box>
              </MenuItem> */}
              {/* <MenuItem
                onClick={navigateToSims}
                sx={{
                  py: 1,
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <ScienceIcon sx={{ mr: 2, color: 'white' }} />
                  <Typography variant="subtitle2" sx={{ color: 'white' }}></Typography>
                </Box>
              </MenuItem> */}
              <MenuItem
                disabled
                sx={{
                  py: 1,
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <SchoolIcon sx={{ mr: 2, color: 'white' }} />
                  <Typography variant="subtitle2" sx={{ color: 'white' }}>Tutorials</Typography>
                </Box>
              </MenuItem>
              <MenuItem
                disabled
                sx={{
                  py: 1,
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <ScienceIcon sx={{ mr: 2, color: 'white' }} />
                  <Typography variant="subtitle2" sx={{ color: 'white' }}>Trading Sims</Typography>
                </Box>
              </MenuItem>
              <MenuItem
                disabled
                sx={{
                  py: 1,
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <SmartToyIcon sx={{ mr: 2, color: 'white' }} />
                  <Typography variant="subtitle2" sx={{ color: 'white' }}>Quant Bot</Typography>
                </Box>
              </MenuItem>
              <MenuItem
                onClick={navigateToBeta}
                sx={{
                  py: 1,
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <AccountBalanceIcon sx={{ mr: 2, color: 'white' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'white', display: 'inline' }}>
                      Quant Portfolios
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'lime',
                        ml: 1,
                        verticalAlign: 'super',
                        fontSize: '0.6rem'
                      }}
                    >
                      (beta)
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              {/* <MenuItem
                onClick={navigateToSub}
                sx={{
                  py: 1,
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <AutoAwesomeIcon sx={{ mr: 2, color: 'white' }} />
                  <Typography variant="subtitle2" sx={{ color: 'white' }}>Upgrade</Typography>
                </Box>
              </MenuItem> */}
              <MenuItem
                onClick={navigateToSettings}
                sx={{
                  py: 1,
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <SettingsIcon sx={{ mr: 2, color: 'white' }} />
                  <Typography variant="subtitle2" sx={{ color: 'white' }}>Settings</Typography>
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <OnboardingModal
        open={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </>
  );
};

export default ResponsiveAppBar;