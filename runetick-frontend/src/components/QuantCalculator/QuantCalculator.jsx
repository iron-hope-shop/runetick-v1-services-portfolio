import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#dfb19f' },
    secondary: { main: '#dfb19f' },
    background: { default: '#121212', paper: '#1e1e1e' },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'transparent',
          boxShadow: 'none',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
  },
});

const steps = ['Portfolio Details', 'Asset Allocation', 'Risk Assessment', 'Review'];

const QuantCalculator = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [portfolioName, setPortfolioName] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investmentStrategy, setInvestmentStrategy] = useState('');
  const [riskTolerance, setRiskTolerance] = useState(5);
  const [autoRebalance, setAutoRebalance] = useState(false);
  const [preferredAssets, setPreferredAssets] = useState([]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Portfolio Name"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Investment Amount (GP)"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Investment Strategy</InputLabel>
                <Select
                  value={investmentStrategy}
                  onChange={(e) => setInvestmentStrategy(e.target.value)}
                >
                  <MenuItem value="conservative">Conservative</MenuItem>
                  <MenuItem value="balanced">Balanced</MenuItem>
                  <MenuItem value="aggressive">Aggressive</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Risk Tolerance</Typography>
              <Slider
                value={riskTolerance}
                onChange={(e, newValue) => setRiskTolerance(newValue)}
                aria-labelledby="risk-tolerance-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={10}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={autoRebalance}
                    onChange={(e) => setAutoRebalance(e.target.checked)}
                  />
                }
                label="Enable Auto-Rebalancing"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Typography gutterBottom>Preferred Assets</Typography>
                <RadioGroup
                  value={preferredAssets}
                  onChange={(e) => setPreferredAssets(e.target.value)}
                >
                  <FormControlLabel value="rares" control={<Radio />} label="Rare Items" />
                  <FormControlLabel value="commodities" control={<Radio />} label="Commodities" />
                  <FormControlLabel value="equipment" control={<Radio />} label="Equipment" />
                  <FormControlLabel value="mixed" control={<Radio />} label="Mixed" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return 'Asset Allocation Content';
      case 2:
        return 'Risk Assessment Content';
      case 3:
        return 'Review Content';
      default:
        return 'Unknown step';
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Back to Dashboard">
                <IconButton 
                  edge="start" 
                  color="inherit" 
                  aria-label="back"
                  sx={{
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': { 
                      transform: 'scale(1.1)',
                      background: alpha('#fff', 0.1),
                    },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold', 
                  ml: 2,
                  background: 'linear-gradient(45deg, #b43634 30%, #dfb19f 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Quant Calculator
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
              Create Your Portfolio
            </Typography>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {activeStep === steps.length ? (
              <>
                <Typography>All steps completed - you're finished</Typography>
                <Button onClick={handleReset} sx={{ mt: 2 }}>
                  Reset
                </Button>
              </>
            ) : (
              <>
                {getStepContent(activeStep)}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                  <Button variant="contained" onClick={handleNext}>
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default QuantCalculator;