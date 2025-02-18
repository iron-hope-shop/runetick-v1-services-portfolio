import React from 'react';
import { Box, Typography, Button, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#fff' },
    secondary: { main: '#83252f' },
    background: { default: '#121212', paper: '#1e1e1e' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(45deg, #dfb19f 30%, #dfb19f 90%)',
          color: '#121212',
          '&:hover': {
            background: 'linear-gradient(45deg, #c99f8f 30%, #c99f8f 90%)',
          },
        },
      },
    },
  },
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            p: 3,
            bgcolor: 'background.default',
            color: 'text.primary',
          }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Oops! Something went wrong.
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ maxWidth: '600px', textAlign: 'center', mb: 4 }}>
              We're sorry for the inconvenience. Our team has been notified and is working on a fix. Please try refreshing the page.
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
              sx={{ mt: 2, fontWeight: 'bold' }}
            >
              Refresh Page
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 4, maxWidth: '80%', overflow: 'auto' }}>
                <Typography variant="h6" sx={{ color: 'error.main' }}>Error Details:</Typography>
                <Box component="pre" sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'error.main',
                  color: 'error.main',
                  fontSize: '0.875rem',
                }}>
                  {this.state.error && this.state.error.toString()}
                  {'\n'}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </Box>
              </Box>
            )}
          </Box>
        </ThemeProvider>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;