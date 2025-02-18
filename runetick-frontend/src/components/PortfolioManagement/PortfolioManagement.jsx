import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  Collapse,
  TextField,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, Tooltip as rcTooltip, ResponsiveContainer } from 'recharts';

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

const mockPortfolios = [
  {
    id: 1,
    name: "Main Investment",
    items: [
      { id: 1, name: 'Dragon bones', quantity: 10000, buyPrice: 2000, currentPrice: 2200 },
      { id: 2, name: 'Abyssal whip', quantity: 5, buyPrice: 1500000, currentPrice: 1600000 },
    ],
    history: [
      { date: '2023-01-01', value: 25000000 },
      { date: '2023-02-01', value: 26000000 },
      { date: '2023-03-01', value: 27000000 },
      { date: '2023-04-01', value: 28000000 },
    ],
  },
  {
    id: 2,
    name: "Flipping Portfolio",
    items: [
      { id: 3, name: 'Nature rune', quantity: 50000, buyPrice: 250, currentPrice: 260 },
      { id: 4, name: 'Cannonball', quantity: 100000, buyPrice: 180, currentPrice: 190 },
    ],
    history: [
      { date: '2023-01-01', value: 30000000 },
      { date: '2023-02-01', value: 31000000 },
      { date: '2023-03-01', value: 32000000 },
      { date: '2023-04-01', value: 33000000 },
    ],
  },
];

const PortfolioManagement = () => {
  const [portfolios, setPortfolios] = useState(mockPortfolios);
  const [expandedPortfolio, setExpandedPortfolio] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const handleExpandPortfolio = (portfolioId) => {
    setExpandedPortfolio(expandedPortfolio === portfolioId ? null : portfolioId);
  };

  const calculatePortfolioValue = (items) => {
    return items.reduce((total, item) => total + item.quantity * item.currentPrice, 0);
  };

  const calculatePortfolioGainLoss = (items) => {
    return items.reduce((total, item) => total + item.quantity * (item.currentPrice - item.buyPrice), 0);
  };

  const handleOpenModal = (content) => {
    setModalContent(content);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalContent(null);
  };

  const handleAddPortfolio = (name) => {
    const newPortfolio = {
      id: Date.now(),
      name,
      items: [],
      history: [{ date: new Date().toISOString().split('T')[0], value: 0 }],
    };
    setPortfolios([...portfolios, newPortfolio]);
    handleCloseModal();
  };

  const handleEditItem = (portfolioId, itemId, updatedItem) => {
    setPortfolios(portfolios.map(portfolio => 
      portfolio.id === portfolioId 
        ? {...portfolio, items: portfolio.items.map(item => 
            item.id === itemId ? {...item, ...updatedItem} : item
          )}
        : portfolio
    ));
    handleCloseModal();
  };

  const renderAddPortfolioModal = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Add New Portfolio</Typography>
      <TextField
        fullWidth
        label="Portfolio Name"
        variant="outlined"
        sx={{ mb: 2 }}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleAddPortfolio(e.target.value);
          }
        }}
      />
      <Button variant="contained" color="primary" onClick={() => handleAddPortfolio(document.querySelector('input').value)}>
        Add Portfolio
      </Button>
    </Box>
  );

  const renderEditItemModal = (portfolioId, item) => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Edit Item</Typography>
      <TextField
        fullWidth
        label="Quantity"
        type="number"
        variant="outlined"
        defaultValue={item.quantity}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Current Price"
        type="number"
        variant="outlined"
        defaultValue={item.currentPrice}
        sx={{ mb: 2 }}
      />
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => handleEditItem(portfolioId, item.id, {
          quantity: parseInt(document.querySelectorAll('input')[0].value),
          currentPrice: parseFloat(document.querySelectorAll('input')[1].value)
        })}
      >
        Save Changes
      </Button>
    </Box>
  );

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
                Portfolio Management
              </Typography>
            </Box>
            <Button 
              color="inherit" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal(renderAddPortfolioModal())}
              sx={{
                transition: 'all 0.3s ease-in-out',
                '&:hover': { 
                  transform: 'scale(1.05)',
                  background: alpha('#fff', 0.1),
                },
              }}
            >
              Add Portfolio
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <List>
            <AnimatePresence>
              {portfolios.map((portfolio) => (
                <motion.div
                  key={portfolio.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper elevation={3} sx={{ mb: 2, overflow: 'hidden' }}>
                    <ListItem button onClick={() => handleExpandPortfolio(portfolio.id)}>
                      <ListItemText 
                        primary={portfolio.name} 
                        secondary={`Total Value: ${calculatePortfolioValue(portfolio.items).toLocaleString()} gp`}
                      />
                      {expandedPortfolio === portfolio.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItem>
                    <Collapse in={expandedPortfolio === portfolio.id} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Items</Typography>
                        <TableContainer component={Paper}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Item</TableCell>
                                <TableCell align="right">Quantity</TableCell>
                                <TableCell align="right">Buy Price</TableCell>
                                <TableCell align="right">Current Price</TableCell>
                                <TableCell align="right">Total Value</TableCell>
                                <TableCell align="right">Gain/Loss</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {portfolio.items.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell align="right">{item.quantity.toLocaleString()}</TableCell>
                                  <TableCell align="right">{item.buyPrice.toLocaleString()} gp</TableCell>
                                  <TableCell align="right">{item.currentPrice.toLocaleString()} gp</TableCell>
                                  <TableCell align="right">{(item.quantity * item.currentPrice).toLocaleString()} gp</TableCell>
                                  <TableCell 
                                    align="right"
                                    sx={{ color: item.currentPrice > item.buyPrice ? 'lime' : 'error.main' }}
                                  >
                                    {((item.currentPrice - item.buyPrice) * item.quantity).toLocaleString()} gp
                                  </TableCell>
                                  <TableCell>
                                    <IconButton size="small" onClick={() => handleOpenModal(renderEditItemModal(portfolio.id, item))}>
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton size="small">
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Portfolio History</Typography>
                        <Box sx={{ height: 200 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={portfolio.history}>
                              <XAxis dataKey="date" />
                              <YAxis />
                              <rcTooltip />
                              <Line type="monotone" dataKey="value" stroke="#8884d8" />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>
                        <Typography variant="h6" sx={{ mt: 2 }}>
                          Total Gain/Loss: 
                          <span style={{ color: calculatePortfolioGainLoss(portfolio.items) > 0 ? 'lime' : 'red', marginLeft: '8px' }}>
                            {calculatePortfolioGainLoss(portfolio.items).toLocaleString()} gp
                          </span>
                        </Typography>
                      </Box>
                    </Collapse>
                  </Paper>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        </Container>
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}>
            {modalContent}
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
};

export default PortfolioManagement;
