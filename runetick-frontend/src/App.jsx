import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { globalTheme } from './globalTheme';
// import Dashboard from './components/Dashboard/Dashboard';
import EnhancedDashboard from './components/Dashboard/EnhancedDashboard';
import ItemLookupPage from './components/ItemLookupPage/ItemLookupPage';
import SettingsPage from './components/SettingsPage/SettingsPage';
import ClosedBetaRegistration from './components/ClosedBetaRegistration/ClosedBetaRegistration';
import ErrorBoundary from './ErrorBoundary';
import {
  Box,
  CircularProgress,
  createTheme,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Typography,
  Grid
} from '@mui/material';
import { Settings as SettingsIcon, CurrencyExchange, TrendingUp, TrendingDown, AddCircleOutline, RemoveCircleOutline, X, Facebook, YouTube, Instagram, EmailOutlined } from '@mui/icons-material';
import SearchBar from './components/SearchBar/SearchBar';
import ResponsiveAppBar from './components/ResponsiveAppBar/ResponsiveAppBar';
import CloseIcon from '@mui/icons-material/Close';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { AuthProvider, useAuth } from './components/AuthProvider/AuthProvider';
import SubscriptionTierPage from './components/SubscriptionTierPage/SubscriptionTierPage';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import LoginScreen from './components/LoginScreen/LoginScreen';
import PasswordResetScreen from './components/LoginScreen/PasswordResetScreen';
import SignUpScreen from './components/LoginScreen/SignUpScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useItemMapping } from './components/Hooks/useItemMapping';
import { ImageCacheProvider } from './components/ImageCacheContext/ImageCacheContext';
import GlassyChatFAB from './components/ChatBox/GlassyChatbox';
import zIndex from '@mui/material/styles/zIndex';
import { useWatchlist } from './components/Hooks/useWatchlist';
import { useWatchlistMutations } from './components/Hooks/useWatchlistMutations';
import { useMultipleItems } from './components/Hooks/useMultipleItems';
import { useRealtimePrices } from './components/Hooks/useRealtimePrices';
import { useNavigate } from 'react-router-dom';
import NotFound from './components/NotFound/NotFound';
import VerifyEmailScreen from './components/LoginScreen/VerifyEmailScreen';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const redirectPath = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectPath)}`} replace />;
  }

  return children;
};

function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, loading } = useAuth();
  const { data: watchlistData = [], isLoading: watchlistLoading } = useWatchlist();
  const { data: itemMapping, isLoading: itemMappingLoading, error: itemMappingError } = useItemMapping();
  const { data: realtimePrices, isLoading: realtimePricesLoading } = useRealtimePrices();
  const navigate = useNavigate();


  const navigateToItem = (itemId) => {
    const queryParams = new URLSearchParams({ id: itemId })
    navigate(`/item?${queryParams}`);
  };
  
  const mockContactAndResources = {
    socialMedia: [
      { name: 'X', icon: X, link: 'https://x.com/runetick' },
      { name: 'YouTube', icon: YouTube, link: 'https://www.youtube.com/@runetick' },
      { name: 'Email', icon: EmailOutlined, link: 'mailto:seer@runetick.com' },
    ],
    contact: {
      email: 'seer@runetick.com',
      discord: 'https://discord.gg/pY4KVd9MjR',
    },
    resources: [
      { name: 'Official OSRS Website', link: 'https://oldschool.runescape.com/' },
      { name: 'OSRS Wiki', link: 'https://oldschool.runescape.wiki/' },
      { name: 'OSRS', link: 'https://discord.gg/yourinvite' },
      { name: 'RuneLite', link: 'https://runelite.net/' },
    ],
  };
  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const DiscordEmbed = ({ serverId, theme = 'dark', width = '350', height = '500' }) => {
    const src = `https://discord.com/widget?id=1257148959902666783&theme=${theme}`;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
        <iframe
          src={src}
          width={width}
          height={height}
          frameBorder="0"
          allowTransparency={true}
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          title="Discord Embed"
        ></iframe>
      </Box>
    );
  };

  const TinyChart = ({ data, color }) => (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={data.map((value, index) => ({ value, index }))}>
        <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.1} />
      </AreaChart>
    </ResponsiveContainer>
  );

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#fff' },
      secondary: { main: '#83252f' },
      background: { default: '#121212', paper: '#1e1e1e' },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(45deg, #dfb19f 30%, #dfb19f 90%)',
          },
        },
      },
    },
  });

  const doNothing = () => {};

  useEffect(() => {
    doNothing();
  }, [watchlistData]);

  if ( loading ) {
    return <LoadingScreen />;
  }

  const ContactAndResources = ({ contactAndResources }) => {
    return (
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.12)', overflow: "auto" }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Contact & Resources</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>Social Media</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {contactAndResources.socialMedia.map((item, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'white', '&:hover': { color: 'primary.main' } }}
                >
                  <item.icon />
                </IconButton>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>Contact</Typography>
            <List dense sx={{ p: 0 }}>
              <ListItem key={"email"} disablePadding sx={{ mb: 0.5 }}>
                <Link
                  href={"mailto:seer@runetick.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <Typography variant="caption" style={{ color: 'inherit' }}>{contactAndResources.contact.email}</Typography>
                </Link>
              </ListItem>
              <ListItem key={"disc"} disablePadding sx={{ mb: 0.5 }}>
                <a
                  href="https://discord.gg/pY4KVd9MjR"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'lime',
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <Typography variant="caption" style={{ color: 'inherit' }}>Runetick Discord</Typography>
                </a>
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>Useful Resources</Typography>
            <List dense sx={{ p: 0 }}>
              {contactAndResources.resources.map((item, index) => (
                <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                  <Link
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'white', // Change text color to lime
                      display: 'flex',
                      alignItems: 'center',
                      textDecoration: 'none', // Remove text decoration
                    }}
                  >
                    {item.icon && <item.icon style={{ marginRight: '8px', fontSize: 'small' }} />}
                    <Typography variant="caption" style={{ color: 'inherit' }}>{item.name}</Typography>
                  </Link>
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" sx={{ color: 'white', mb: 1 }}>
              A special thanks to the OSRS Wiki Discord community for guidance throughout this project.
              All price data is retrieved from the OSRS Wiki via the
              <a
                href="https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'lime',
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                }}
              >
                <Typography variant="caption" style={{ color: 'inherit' }}>RuneScape: Real-time Prices API</Typography>
              </a>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Routes>
        <Route path="/" element={!user ? <LoginScreen /> : <Navigate to="/home" replace />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/reset" element={<PasswordResetScreen />} />
        <Route path="/verify-email" element={<VerifyEmailScreen />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <EnhancedDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/item"
          element={
            <ProtectedRoute>
              <ItemLookupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/beta"
          element={
            <ProtectedRoute>
              <ClosedBetaRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trading-sims"
          element={
            <ProtectedRoute>
              <></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <SubscriptionTierPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} /> {/* Redirect to home page for 404 */}

      </Routes>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        {
          // const { data: watchlistData = [], isLoading: watchlistLoading } = useWatchlist();
          // const { data: itemMapping, isLoading: itemMappingLoading, error: itemMappingError } = useItemMapping();
          // const { data: realtimePrices, isLoading: realtimePricesLoading } = useRealtimePrices();
          // const { removeItemMutation } = useWatchlistMutations();
          (user && !watchlistLoading && !itemMappingLoading && !realtimePricesLoading) && (<>
            <ResponsiveAppBar
              toggleDrawer={toggleDrawer}
            />
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  background: 'transparent',
                  boxShadow: 'none',
                  backdropFilter: 'blur(10px)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                  width: '360px',
                  zIndex: 99999,
                },
              }}
              ModalProps={{
                sx: {
                  zIndex: 11, // This sets the z-index for the overlay
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  backgroundColor: 'rgba(18, 18, 18, 0.8)',
                  overflow: 'auto',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 2,
                    height: 64,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    bgcolor: 'rgba(18, 18, 18, 0.95)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <IconButton onClick={toggleDrawer(false)} sx={{ color: 'white' }}>
                    <CloseIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ color: 'white' }}>Watch List</Typography>
                </Box>

                <List sx={{ padding: 0 }}>
                  {realtimePrices && watchlistData.length > 0 && itemMapping ? watchlistData.map(itemId => {
                    const itemMatch = itemMapping ? itemMapping.find(mapping => mapping.id === itemId) : undefined; const realTimePriceInfo = realtimePrices[itemId]; // Access the real-time price information using itemId
                    return (
                      <ListItem
                        key={itemId}
                        onClick={() => navigateToItem(itemId)}
                        sx={{
                          py: 1,
                          borderRadius: '4px',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Box sx={{ flexGrow: 1, mr: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: 'white' }}>{itemMatch.name}</Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              minWidth: '55px',
                              justifyContent: 'flex-end',
                            }}
                          >
                            {realTimePriceInfo.high.toLocaleString()} gp
                          </Typography>

                          {/* <IconButton
                            // onClick={(event) => {
                            //   event.stopPropagation(); // Prevent event from propagating to the parent
                            //   handleRemoveItem(itemId);
                            // }}
                            // onClick={() => handleRemoveItem(selectedItem.id)}
                            disabled={isRemoveDisabled}
                            sx={{ color: 'rgba(255, 255, 255, 0.3)' }}
                            onClick={(event) => {
                              event.stopPropagation(); // Prevent event from propagating to the parent
                              handleRemoveItem(itemId);
                            }}
                            // onClick={() => handleRemoveItem(selectedItem.id)}
                            // disabled={isRemoveDisabled}
                          >
                            <RemoveCircleOutline />
                          </IconButton> */}
                        </Box>
                      </ListItem>
                    );
                  }) : <ListItem
                    key={69}
                    sx={{
                      py: 1,
                      borderRadius: '4px',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ flexGrow: 1, mr: 1, p: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: 'white' }}>Visit an item page to "add to watchlist"</Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          minWidth: '55px',
                          justifyContent: 'flex-end',
                        }}
                      >
                      </Typography>
                    </Box>
                  </ListItem>}
                </List>
                <ContactAndResources contactAndResources={mockContactAndResources} />
              </Box>
            </Drawer>
            {/* <GlassyChatFAB /> */}
          </>)
        }
        <Box sx={{ paddingTop: '64px' }}>
          {/* {currentPage === 'dashboard' && (
            <EnhancedDashboard itemMapping={itemMapping} onItemSelect={handleItemSelect} />
          )} */}

          {/* {currentPage === 'itemLookup' && (
            <ItemLookupPage
              onItemSelect={handleItemSelect}
              selectedItem={selectedItem}
              onBackToDashboard={handleBackToDashboard}
            />
          )}
          
          {currentPage === 'closedBeta' && (
            <ClosedBetaRegistration />
          )}
          {currentPage === 'paperTrading' && (
            <></>
          )}
          {currentPage === 'subscriptions' && (
            <SubscriptionTierPage />
          )} */}
        </Box>
      </Box>
      {/* <ChatBox /> */}
    </ThemeProvider>
  );
}

function App() {
  const queryClient = new QueryClient();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ImageCacheProvider>
            <Router>
              <AppContent />
            </Router>
          </ImageCacheProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
