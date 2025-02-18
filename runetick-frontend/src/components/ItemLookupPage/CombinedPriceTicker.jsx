import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  TableSortLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Modal,
  TextField,
  CircularProgress
} from "@mui/material";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ArrowBack, ArrowForward, FirstPage, LastPage } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { useLastTenChanges } from '../Hooks/useLastTenChanges';

const getFlashColor = (glow, priceDiff) => {
  if (!glow) return 'white';
  if (priceDiff === 0) return 'white';
  return priceDiff > 0 ? 'lime' : 'red';
};
const ColoredSortLabel = ({ active, direction, onClick, children }) => {
  const color = direction === 'asc' ? 'white' : 'white';
  return (
    <TableSortLabel
      active={active}
      direction={direction}
      onClick={onClick}
      sx={{
        color: active ? `${color} !important` : 'inherit',
        '&:hover': {
          color: `${color} !important`,
        },
        '& .MuiTableSortLabel-icon': {
          color: `${color} !important`,
        },
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {children}
    </TableSortLabel>
  );
};

const AlchProfits = ({ profit, runeCost, highAlch }) => {
  if (profit === undefined) {
    return null;
  }

  const color = profit > 0 ? 'lime' : profit < 0 ? 'error.main' : 'text.primary';

  return (
    <>
      <Typography
        variant="caption"
        sx={{
          color,
          display: 'flex',
          alignItems: 'center',
          '@media (max-width: 500px)': {
            textAlign: 'left'
          }
        }}
      >
        <img
          src="https://oldschool.runescape.wiki/images/High_Level_Alchemy_icon_%28mobile%29.png"
          alt="High Level Alchemy Icon"
          style={{ width: '32px', height: '32px', marginRight: '8px' }}
        />
        {/* {profit ? `${profit.toLocaleString()} GP` : "Cannot be alched"} */}
      </Typography>
    </>
  );
};

const PriceHistoryModal = ({ id, open, handleClose, priceHistory }) => {
  const [sortedHistory, setSortedHistory] = useState([]);
  const [orderBy, setOrderBy] = useState('timestamp');
  const [order, setOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState('1');
  const { data: lastTenChanges, isLoading: isLastTenChangesLoading, error: LastTenChangesError } = useLastTenChanges();
  const itemsPerPage = 5;

  useEffect(() => {
    if (lastTenChanges && lastTenChanges[id]) {
      const sorted = [...lastTenChanges[id]].sort(sortFunction);
      setSortedHistory(sorted);
    } else {
      setSortedHistory([]);
    }
  }, [lastTenChanges, id, order, orderBy]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortFunction = (a, b) => {
    let comparison = 0;
    if (orderBy === 'timestamp') {
      comparison = new Date(b.timestamp) - new Date(a.timestamp);
    } else {
      comparison = b[orderBy] - a[orderBy];
    }
    return order === 'desc' ? comparison : -comparison;
  };

  useEffect(() => {
    setSortedHistory(prevHistory => [...prevHistory].sort(sortFunction));
  }, [order, orderBy, priceHistory]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setInputPage(newPage.toString());
  };

  const handleInputChange = (event) => {
    setInputPage(event.target.value);
  };

  const handleInputSubmit = (event) => {
    event.preventDefault();
    const pageNumber = parseInt(inputPage, 10);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    } else {
      setInputPage(currentPage.toString());
    }
  };

  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);
  const paginatedHistory = sortedHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageInputChange = (event) => {
    const pageNumber = Number(event.target.value);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getPercentChangeColor = (percentChange) => {
    if (percentChange > 0) return 'lime';
    if (percentChange < 0) return 'red';
    return 'white';
  };

  if (isLastTenChangesLoading) {
    return (
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      </Modal>
    );
  }

  if (LastTenChangesError) {
    return (
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="error">Error loading price history</Typography>
        </Box>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="price-history-modal"
      aria-describedby="modal-showing-price-history"
      sx={{ zIndex: 11 }}
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 900,
        height: 448,
        bgcolor: 'rgba(18, 18, 18, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        outline: 'none',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: -2 }}>
          <Typography variant="h6" component="h2" sx={{ color: 'white' }}>
            Price History
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <TableContainer sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'transparent', height: "512px" }}>
          <Table stickyHeader aria-label="price history table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 30, 0.9)', color: 'white' }}>
                  <ColoredSortLabel
                    active={orderBy === 'timestamp'}
                    direction={orderBy === 'timestamp' ? order : 'desc'}
                    onClick={() => handleRequestSort('timestamp')}
                  >
                    Timestamp
                  </ColoredSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ bgcolor: 'rgba(30, 30, 30, 0.9)', color: 'white' }}>
                  <ColoredSortLabel
                    active={orderBy === 'lastPrice'}
                    direction={orderBy === 'lastPrice' ? order : 'desc'}
                    onClick={() => handleRequestSort('lastPrice')}
                  >
                    Price
                  </ColoredSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* {paginatedHistory && paginatedHistory.length === 0 && ( 
                  "History will update when items are traded..."
              )} */}
              {paginatedHistory.map((record, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{
                    color: 'rgba(255, 255, 255, 0.87)',
                    maxWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {new Date(record.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{
                    color: 'rgba(255, 255, 255, 0.87)',
                    maxWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {record.lastPrice.toLocaleString()} gp
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Modal>
  );
};

const CombinedPriceTicker = ({ id, percentChange, currentPrice, previousPrice, alchProfit, runeCost, highAlch }) => {
  const priceDiff = currentPrice - previousPrice;
  const isPositive = priceDiff >= 0;
  const [glow, setGlow] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const lastPriceRef = useRef();

  const flashPrice = useCallback(() => {
    setGlow(true);
    if (lastPriceRef.current) {
      lastPriceRef.current.style.color = getFlashColor(true, priceDiff);
    }
    setTimeout(() => {
      setGlow(false);
      if (lastPriceRef.current) {
        lastPriceRef.current.style.color = 'white';
      }
    }, 1000);
  }, [priceDiff]);

  useEffect(() => {
    flashPrice();
  }, [currentPrice, flashPrice]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          '& > * + *': {
            marginTop: '8px',
          },
          '@media (max-width: 500px)': {
            alignItems: 'flex-start'
          }
        }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                '@media (max-width: 500px)': {
                  textAlign: 'left'
                }
              }}
            >
              Realtime Price
            </Typography>
          {currentPrice !== undefined && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                transition: 'color 0.3s ease-in-out',
                '@media (max-width: 500px)': {
                  textAlign: 'left'
                }
              }}
              ref={lastPriceRef}
            >
              {currentPrice.toLocaleString()} gp
            </Typography>
          )}
          {previousPrice !== undefined && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                '@media (max-width: 500px)': {
                  textAlign: 'left'
                }
              }}
            >
              Last: {previousPrice.toLocaleString()} gp
            </Typography>
          )}
          {priceDiff !== undefined && percentChange !== undefined && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              color: priceDiff === 0 ? 'white' : isPositive ? 'lime' : 'red',
              '@media (max-width: 500px)': {
                textAlign: 'left'
              }
            }}>
              {priceDiff !== 0 && (isPositive ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />)}
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {
                  `${new Intl.NumberFormat('en-US').format(Math.abs(priceDiff))} (${new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(percentChange / 100)})`
                }
              </Typography>
            </Box>
          )}
          <Typography
            variant="caption"
            color="rgba(255, 255, 255, 0.7)"
            onClick={handleOpenModal}
            sx={{
              cursor: 'pointer',
              textDecoration: 'underline',
              '@media (max-width: 500px)': {
                textAlign: 'left'
              }
            }}
          >
            [...price history]
          </Typography>
          {/* <AlchProfits profit={alchProfit} runeCost={runeCost} highAlch={highAlch} /> */}
          <PriceHistoryModal id={id} open={modalOpen} handleClose={handleCloseModal} />
        </Box>
  );
};

export default CombinedPriceTicker;