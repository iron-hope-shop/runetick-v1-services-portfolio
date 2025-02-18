import React, { useEffect, useState } from 'react';
import { Box, Typography, TableContainer, Table, TableRow, TableHead, TableCell, TableSortLabel, Grid, TableBody, IconButton, TextField, Button, CircularProgress } from '@mui/material';
import { useRealtimePrices } from '../Hooks/useRealtimePrices';
import { useItemMapping } from '../Hooks/useItemMapping';
import { ArrowBack, ArrowForward, FirstPage, LastPage } from '@mui/icons-material';
import { useVolumes } from '../Hooks/useVolumes';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

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

const OSRSCompleteGE = () => {
    const [sortedItems, setSortedItems] = useState([]);
    const [orderBy, setOrderBy] = useState('name');
    const [order, setOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [inputPage, setInputPage] = useState('1');
    const itemsPerPage = 8;
    const { data: itemsData, isLoading: realtimePricesLoading } = useRealtimePrices();
    const { data: itemMapping, isLoading: itemMappingLoading } = useItemMapping();
    const { data: volumeData, isLoading: isVolumesLoading, error: volumesError } = useVolumes();
    const navigate = useNavigate();

    const navigateToItem = (itemId) => {
        const queryParams = new URLSearchParams({ id: itemId })
        navigate(`/item?${queryParams}`);
    };

    if (!volumeData) {
        console.error('One of the required datasets is undefined');
        // Handle the error appropriately
    }

    useEffect(() => {
        if (itemsData && itemMapping && volumeData) {
            const items = Object.entries(itemsData).map(([id, data]) => {
                const item = itemMapping.find(item => item.id === parseInt(id));
                const volume = volumeData[id] || {};

                return {
                    id,
                    ...data,
                    lastPrice: data.highTime > data.lowTime ? data.high : data.low,
                    name: item?.name,
                    limit: item?.limit,
                    hiVol: volume.highPriceVolume || 0,
                    loVol: volume.lowPriceVolume || 0,
                    totalVol: (volume.highPriceVolume || 0) + (volume.lowPriceVolume || 0),
                };
            });
            setSortedItems(items);
        }
    }, [itemsData, itemMapping, volumeData]);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(property);
        setCurrentPage(1)
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

    const getPercentChangeColor = (percentChange) => {
        if (percentChange > 0) return 'lime';
        if (percentChange < 0) return 'red';
        return 'white';
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        setInputPage(newPage.toString());
    };

    const handleInputChange = (event) => {
        setInputPage(event.target.value);
    };

    const handlePageInputChange = (event) => {
        const pageNumber = Number(event.target.value);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
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

    const exportToCSV = () => {
        const csv = Papa.unparse(sortedItems);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        const currentDateTime = new Date().toLocaleString().replace(/[/,: ]/g, '_');
        saveAs(blob, `GE_data_${currentDateTime}.csv`);
    };

    if (realtimePricesLoading || itemMappingLoading || isVolumesLoading || !paginatedItems ) {
        return <Box sx={{ 
        mt: 2,
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',

         }}>
        <CircularProgress 
        size={60} 
        thickness={4} 
        sx={{ 
          color: "yellow",
          animation: `MuiCircularProgress-keyframes-circular-rotate 1s linear infinite normal`,
        }} 
      />
      
      <Typography variant="body1" color="text.secondary" sx={{ marginTop: 2, color: 'white' }}>
        Walking to GE...
      </Typography>
      </Box>
    }


    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{
                display: { xs: 'flex', sm: 'flex' }, // Adjust display properties for responsiveness
                alignItems: 'left',
                justifyContent: 'left',
                mb: 2,
                whiteSpace: 'nowrap', // Prevent text from wrapping
            }}>

                <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>The Grand Exchange</Typography>
                <Box sx={{
                    display: { xs: 'none', sm: 'flex' },
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end', // Align items to the right

                    width: '100%',
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
            </Box>

            <TableContainer sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'transparent', height: "512px" }}>
                <Table stickyHeader aria-label="item data table">
                    <TableHead>
                        <TableRow>
                            <TableCell align='left' sx={{ bgcolor: 'transparent', color: 'white' }}>
                                <ColoredSortLabel
                                    active={orderBy === 'name'}
                                    direction={orderBy === 'name' ? order : 'asc'}
                                    onClick={() => handleRequestSort('name')}
                                >
                                    Name
                                </ColoredSortLabel>
                            </TableCell>
                            <TableCell align='left' sx={{ bgcolor: 'transparent', color: 'white' }}>
                                <ColoredSortLabel
                                    active={orderBy === 'limit'}
                                    direction={orderBy === 'limit' ? order : 'asc'}
                                    onClick={() => handleRequestSort('limit')}
                                >
                                    Limit
                                </ColoredSortLabel>
                            </TableCell>
                            <TableCell align="left" sx={{ bgcolor: 'transparent', color: 'white' }}>
                                <ColoredSortLabel
                                    active={orderBy === 'lastPrice'}
                                    direction={orderBy === 'lastPrice' ? order : 'asc'}
                                    onClick={() => handleRequestSort('lastPrice')}
                                >
                                    Last Traded @
                                </ColoredSortLabel>
                            </TableCell>
                            <TableCell align="left" sx={{ bgcolor: 'transparent', color: 'white' }}>
                                <ColoredSortLabel
                                    active={orderBy === 'high'}
                                    direction={orderBy === 'high' ? order : 'asc'}
                                    onClick={() => handleRequestSort('high')}
                                >
                                    High Price
                                </ColoredSortLabel>
                            </TableCell>
                            <TableCell align="left" sx={{ bgcolor: 'transparent', color: 'white' }}>
                                <ColoredSortLabel
                                    active={orderBy === 'low'}
                                    direction={orderBy === 'low' ? order : 'asc'}
                                    onClick={() => handleRequestSort('low')}
                                >
                                    Low Price
                                </ColoredSortLabel>
                            </TableCell>
                            <TableCell align="left" sx={{ bgcolor: 'transparent', color: 'white' }}>
                                <ColoredSortLabel
                                    active={orderBy === 'percentChange'}
                                    direction={orderBy === 'percentChange' ? order : 'asc'}
                                    onClick={() => handleRequestSort('percentChange')}
                                >
                                    % Change
                                </ColoredSortLabel>
                            </TableCell>
                            <TableCell align="left" sx={{ bgcolor: 'transparent', color: 'white' }}>
                                <ColoredSortLabel
                                    active={orderBy === 'hiVol'}
                                    direction={orderBy === 'hiVol' ? order : 'asc'}
                                    onClick={() => handleRequestSort('hiVol')}
                                >
                                    High Volume (24hrs)
                                </ColoredSortLabel>
                            </TableCell>
                            <TableCell align="left" sx={{ bgcolor: 'transparent', color: 'white' }}>
                                <ColoredSortLabel
                                    active={orderBy === 'loVol'}
                                    direction={orderBy === 'loVol' ? order : 'asc'}
                                    onClick={() => handleRequestSort('loVol')}
                                >
                                    Low Volume (24hrs)
                                </ColoredSortLabel>
                            </TableCell>
                            <TableCell align="left" sx={{ bgcolor: 'transparent', color: 'white' }}>
                                <ColoredSortLabel
                                    active={orderBy === 'totalVol'}
                                    direction={orderBy === 'totalVol' ? order : 'asc'}
                                    onClick={() => handleRequestSort('totalVol')}
                                >
                                    Total Volume (24hrs)
                                </ColoredSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedItems.map((item, index) => {
                            return (
                                <TableRow
                                    key={item?.id}
                                    hover
                                    onClick={() => navigateToItem(item.id)}
                                    sx={{
                                        height: '50px',
                                        backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                                    }}
                                >
                                    <TableCell
                                        align='left'
                                        title={item?.name}
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.87)',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {item.name ? item.name : "Unknown Item"}
                                    </TableCell>
                                    <TableCell
                                        align="left"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.87)',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {item?.limit ? item.limit?.toLocaleString() : "??"} units
                                    </TableCell>
                                    <TableCell
                                        align="left"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.87)',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {item.lastPrice?.toLocaleString()} gp
                                    </TableCell>
                                    <TableCell
                                        align="left"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.87)',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {item.high?.toLocaleString()} gp
                                    </TableCell>
                                    <TableCell
                                        align="left"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.87)',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {item.low?.toLocaleString()} gp
                                    </TableCell>
                                    <TableCell
                                        align="left"
                                        sx={{
                                            color: getPercentChangeColor(item?.percentChange),
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {
                                            item?.percentChange === null
                                                ? '0.00%'
                                                : `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(item.percentChange))}%`
                                        }
                                    </TableCell>
                                    <TableCell
                                        align="left"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.87)',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {item?.hiVol.toLocaleString()} units
                                    </TableCell>
                                    <TableCell
                                        align="left"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.87)',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {item?.loVol.toLocaleString()} units
                                    </TableCell>
                                    <TableCell
                                        align="left"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.87)',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {item?.totalVol.toLocaleString() || "?"} units
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{
                display: { xs: 'flex', sm: 'none' },
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
    );
};

export default OSRSCompleteGE;
