import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal, createTheme, ThemeProvider, Table, IconButton, Button, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField } from '@mui/material';
import { useItemMapping } from '../Hooks/useItemMapping';
import CloseIcon from '@mui/icons-material/Close';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { ItemIcon } from '../ItemIcon/ItemIcon';
import { ArrowBack, ArrowForward, FirstPage, LastPage } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#fff' },
    secondary: { main: '#fff' },
    background: { default: '#121212', paper: 'rgba(30, 30, 30, 0.1)' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const ColoredSortLabel = ({ active, direction, onClick, children }) => {
  const color = direction === 'asc' ? 'lime' : 'red';
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

const ItemDataModal = ({ open, handleClose, itemsData, name, onItemSelect }) => {
  const { data: itemMapping } = useItemMapping();
  const [sortedItems, setSortedItems] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState('1');
  const itemsPerPage = 6;
  const navigate = useNavigate();

  const navigateToItem = (itemId) => {
    const queryParams = new URLSearchParams({ id: itemId })
    navigate(`/item?${queryParams}`);
  };

  useEffect(() => {
    const items = Object.entries(itemsData).map(([id, data]) => ({
      id,
      ...data,
      name: itemMapping?.find(item => item.id === parseInt(id))?.name || id,
    }));
    setSortedItems(items);
  }, [itemsData, itemMapping]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'desc';
    setOrder(isAsc ? 'asc' : 'desc');
    setOrderBy(property);
  };

  const sortFunction = (a, b) => {
    let comparison = 0;
    if (a[orderBy] < b[orderBy]) {
      comparison = -1;
    } else if (a[orderBy] > b[orderBy]) {
      comparison = 1;
    }
    return order === 'asc' ? comparison * -1 : comparison;
  };

  useEffect(() => {
    setSortedItems(prevItems => [...prevItems].sort(sortFunction));
  }, [order, orderBy, itemsData]);

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

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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


  const exportToCSV = () => {
    const csv = Papa.unparse(sortedItems);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const currentDateTime = new Date().toLocaleString().replace(/[/,: ]/g, '_');
    saveAs(blob, `${name}_index_${currentDateTime}.csv`);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="item-data-modal"
      aria-describedby="modal-showing-item-data"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 900,
        maxHeight: '90vh',
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
            {name} Index
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
          <Table stickyHeader aria-label="item data table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'transparent', color: 'white' }}>Icon</TableCell>
                <TableCell sx={{ bgcolor: 'transparent', color: 'white' }}>
                  <ColoredSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    Name
                  </ColoredSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ bgcolor: 'transparent', color: 'white' }}>
                  <ColoredSortLabel
                    active={orderBy === 'lastPrice'}
                    direction={orderBy === 'lastPrice' ? order : 'asc'}
                    onClick={() => handleRequestSort('lastPrice')}
                  >
                    Last Price
                  </ColoredSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ bgcolor: 'transparent', color: 'white' }}>
                  <ColoredSortLabel
                    active={orderBy === 'highPrice'}
                    direction={orderBy === 'highPrice' ? order : 'asc'}
                    onClick={() => handleRequestSort('highPrice')}
                  >
                    High Price
                  </ColoredSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ bgcolor: 'transparent', color: 'white' }}>
                  <ColoredSortLabel
                    active={orderBy === 'lowPrice'}
                    direction={orderBy === 'lowPrice' ? order : 'asc'}
                    onClick={() => handleRequestSort('lowPrice')}
                  >
                    Low Price
                  </ColoredSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ bgcolor: 'transparent', color: 'white' }}>
                  <ColoredSortLabel
                    active={orderBy === 'percentChange'}
                    direction={orderBy === 'percentChange' ? order : 'asc'}
                    onClick={() => handleRequestSort('percentChange')}
                  >
                    % Change
                  </ColoredSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
    {paginatedItems.map((item, index) => {
        return (
            <TableRow
                key={item.id}
                hover
                onClick={() => navigateToItem(item.id)}
                sx={{
                    backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                }}
            >
                <TableCell>
                    <ItemIcon
                        src={`https://oldschool.runescape.wiki/images/${itemMapping?.find(mappedItem => mappedItem.id === parseInt(item.id))?.icon.replace(/ /g, '_') || 'default.png'}`}
                        alt="item"
                    />
                </TableCell>
                <TableCell
                    sx={{
                        color: 'rgba(255, 255, 255, 0.87)',
                        maxWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {item.name}
                </TableCell>
                <TableCell
                    align="right"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.87)',
                        maxWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {item.lastPrice.toLocaleString()}
                </TableCell>
                <TableCell
                    align="right"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.87)',
                        maxWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {item.highPrice.toLocaleString()}
                </TableCell>
                <TableCell
                    align="right"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.87)',
                        maxWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {item.lowPrice.toLocaleString()}
                </TableCell>
                <TableCell
                    align="right"
                    sx={{
                        color: getPercentChangeColor(item.percentChange)
                    }}
                >
                    {item.percentChange === null ? '0.00%' : `${parseFloat(item.percentChange).toFixed(2)}%`}
                </TableCell>
            </TableRow>
        );
    })}
</TableBody>
          </Table>
        </TableContainer>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Center the content horizontally
          pt: 2, // Padding top of 2 units
        }}>
          <IconButton
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            sx={{ color: 'white' }}
          >
            <FirstPage />
          </IconButton>
          <IconButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            sx={{ color: 'white' }}
          >
            <ArrowBack />
          </IconButton>
          <form onSubmit={handleInputSubmit} style={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              value={currentPage}
              onChange={handlePageInputChange}
              type="number"
              variant="outlined"
              size="small"
              sx={{
                width: '70px',
                mx: 1,
                input: { color: 'white', textAlign: 'center' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
              }}
              InputProps={{
                inputProps: {
                  min: 1,
                  max: totalPages
                }
              }}
            />
            <Typography variant="body1" sx={{ mx: 1, color: 'white' }}>
              of {totalPages}
            </Typography>
          </form>
          <IconButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            sx={{ color: 'white' }}
          >
            <ArrowForward />
          </IconButton>
          <IconButton
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            sx={{ color: 'white' }}
          >
            <LastPage />
          </IconButton>
        </Box>

        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 2 }}>
                <IconButton
                    color="primary"
                    onClick={exportToCSV}
                    sx={{
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                        width: '48px',
                    }}
                >
                    <FileDownloadIcon />
                </IconButton>
            </Box>
      </Box>
    </Modal>
  );
};

const IndexCard = ({ name, data }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { averagePrice, averagePercentChange, description, isDown, itemIds, itemsData } = data;
  const itemCount = itemIds.length;

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ p: 2, border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '4px' }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 1, textTransform: 'capitalize' }}>{name}</Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            mt: 1,
            '&:hover': {
              textDecoration: 'underline',
            }
          }}
          onClick={handleOpenModal}
        >
          {/* <LaunchIcon 
            sx={{ 
              fontSize: 'small', 
              mr: 0.5, 
              color: 'rgba(255, 255, 255, 0.7)',
            }} 
          /> */}
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'inline',
            }}
          >
            {itemCount} {itemCount > 1 ? "items" : "item"} | {description}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mt: 1 }}>
          <Typography variant="h6" sx={{ color: isDown ? 'red' : 'lime', fontWeight: 'bold' }}>
            {averagePrice.toLocaleString()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', color: isDown ? 'red' : 'lime' }}>
            {isDown ? <TrendingDown /> : <TrendingUp />}
            <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 1 }}>
              {Math.abs(averagePercentChange).toFixed(2)}%
            </Typography>
          </Box>
        </Box>
      </Box>
      <ItemDataModal open={modalOpen} handleClose={handleCloseModal} itemsData={itemsData} name={name} />
    </ThemeProvider>
  );
};

export default IndexCard;