import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, Divider, TableHead, TableRow, TextField, Grid, Autocomplete, IconButton, Popover, Select, MenuItem, FormControl, InputLabel, TableSortLabel, CircularProgress } from '@mui/material';
import { ItemIcon } from '../ItemIcon/ItemIcon';
import { useDebounce } from '../Hooks/useDebounce';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useUserLogMutations } from '../Hooks/useUserLogMutations';
import { useUserLogs } from '../Hooks/useUserLogs';
import { useItemMapping } from '../Hooks/useItemMapping';
import { useRealtimePrices } from '../Hooks/useRealtimePrices';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, ArrowForward, FirstPage, LastPage } from '@mui/icons-material';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

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

const RecordYourTrade = () => {
    const { data: logs, isLoading: logsLoading, error: logsError, refetch } = useUserLogs();
    const { data: itemMapping, isLoading: mappingLoading, error: mappingError } = useItemMapping();
    const { data: realtimePrices, isLoading: realtimePricesLoading, error: realtimePricesError } = useRealtimePrices();
    const { createLogMutation, deleteLogMutation } = useUserLogMutations();
    const [newTrade, setNewTrade] = useState({
        item: null,
        modifier: 'CREATE',
        action: 'TRADE',
        quantity: '',
        price: '',
        tradeType: 'BUY',
        timestamp: new Date().toISOString().split('T')[0] // Initialize with current date in YYYY-MM-DD format
    });

    // pagination
    const [sortedItems, setSortedItems] = useState([]);
    const [orderBy, setOrderBy] = useState('timestamp');
    const [order, setOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [inputPage, setInputPage] = useState('1');
    const itemsPerPage = 8;
    const [selectedId, setSelectedId] = useState(null);
    const navigate = useNavigate();


    const navigateToItem = (itemId) => {
        const queryParams = new URLSearchParams({ id: itemId })
        navigate(`/item?${queryParams}`);
    };

    // search?
    const [searchInput, setSearchInput] = useState('');
    const [filteredOptions, setFilteredOptions] = useState([]);

    const handleDelSubmit = (event) => {
        event.preventDefault();
        // Perform your DELETE action here using the selectedId
    };

    useEffect(() => {
        if (logs && itemMapping) {
            const entries = Object.entries(logs).map(([id, log]) => {
                const itemPrice = realtimePrices && log.item && realtimePrices[log.item] ? realtimePrices[log.item] : null;
                const highTime = itemPrice ? itemPrice.highTime : null;
                const lowTime = itemPrice ? itemPrice.lowTime : null;
                const high = itemPrice ? itemPrice.high : null;
                const low = itemPrice ? itemPrice.low : null;

                const currentPrice = highTime > lowTime ? high : low;
                const profit = currentPrice ? currentPrice - log.price : null;
                const profitPercentage = currentPrice ? (currentPrice - log.price) / log.price : null;

                return {
                    id,
                    ...log,
                    amount: (log.quantity || 0) * (log.price || 0),
                    currentPrice,
                    profit,
                    profitPercentage
                };
            });
            setSortedItems(entries);
        }
    }, [logs, itemMapping]);

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
    }, [order, orderBy, logs]);

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

    const debouncedSearchInput = useDebounce(searchInput, 500);

    const filterOptions = useCallback((options, input) => {
        if (!options || !Array.isArray(options)) {
            return [];
        }

        const searchValue = typeof input === 'string' ? input.toLowerCase() : '';
        return options.filter(option =>
            option.name.toLowerCase().includes(searchValue)
        ).slice(0, 5);
    }, []);

    useEffect(() => {
        if (itemMapping && debouncedSearchInput !== undefined) {
            const filtered = filterOptions(itemMapping, debouncedSearchInput);
            setFilteredOptions(filtered);
        } else {
            setFilteredOptions([]);
        }
    }, [itemMapping, debouncedSearchInput, filterOptions]);

    const handleActionChange = (e) => {
        const action = e.target.value;
        setNewTrade(prevTrade => ({
            ...prevTrade,
            action: action,
            tradeType: action === 'TRADE' ? 'BUY' : null,
            price: action === 'TRADE' ? prevTrade.price : ''
        }));
    };

    const handleModifyChange = (e) => {
        const modifier = e.target.value;
        setNewTrade(prevTrade => ({
            ...prevTrade,
            modifier: modifier
        }));
    };

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^[0-9]\d*$/.test(value)) {
            setNewTrade({ ...newTrade, quantity: value });
        }
    };

    const handlePriceChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^[0-9]\d*$/.test(value)) {
            setNewTrade({ ...newTrade, price: value });
        }
    };

    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        handleSetCurrentTime();
    }, []);

    const handleSetCurrentTime = () => {
        const date = new Date();
        setNewTrade({ ...newTrade, timestamp: formatDateTimeForInput(date) });
    };

    const formatDateTimeForInput = (date) => {
        // const formatted = date.toISOString().slice(0, 19).replace('T', ' ');
        const formatted = date
        return formatted;
    };

    const handleDateChange = (date) => {
        const currentTimestamp = new Date(newTrade.timestamp);
        const newDate = new Date(date);

        // Preserve the existing time components
        newDate.setHours(currentTimestamp.getHours());
        newDate.setMinutes(currentTimestamp.getMinutes());
        newDate.setSeconds(currentTimestamp.getSeconds());

        setNewTrade({ ...newTrade, timestamp: formatDateTimeForInput(newDate) });
    };

    const handleTimeChange = (type, value) => {
        const newDate = new Date(newTrade.timestamp);
        let hours = newDate.getHours();
        let isPM = hours >= 12;
        switch (type) {
            case 'hours':
                const newHours = parseInt(value, 10);
                if (isPM && newHours !== 12) {
                    hours = newHours + 12;
                } else if (!isPM && newHours === 12) {
                    hours = 0;
                } else {
                    hours = newHours;
                }
                newDate.setHours(hours);
                break;
            case 'minutes':
                const newMinutes = parseInt(value, 10);
                newDate.setMinutes(newMinutes);
                break;
            case 'seconds':
                const newSeconds = parseInt(value, 10);
                newDate.setSeconds(newSeconds);
                break;
            case 'ampm':
                if (value === 'AM' && isPM) {
                    newDate.setHours(hours - 12);
                } else if (value === 'PM' && !isPM) {
                    newDate.setHours(hours + 12);
                } else {
                }
                break;
            default:
                console.warn(`Unhandled time change type: ${type}`);
                return;
        }

        const formattedDateTime = formatDateTimeForInput(newDate);

        setNewTrade({ ...newTrade, timestamp: formattedDateTime });
    };


    const formatDisplayDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const handleSubmit = () => {
        // Validate required fields based on action
        if (!newTrade.item) {
            alert('Please select an item.');
            return;
        }

        const quantity = parseInt(newTrade.quantity, 10);

        if (!quantity || isNaN(quantity)) {
            alert('Please enter a valid quantity.');
            return;
        }

        if (newTrade.action === 'TRADE') {
            const price = parseInt(newTrade.price, 10);
            if (!price || isNaN(price)) {
                alert('Please enter a valid price for trades.');
                return;
            }
        }

        // If all required fields are filled and valid, proceed with submission
        const submittedTrade = {
            ...newTrade,
            item: newTrade.item ? newTrade.item.id : null,
            modifier: newTrade.modifier === "DELETE" ? "DELETE" : "CREATE",
            quantity: quantity,
            price: newTrade.action === 'TRADE' ? parseInt(newTrade.price, 10) : null,
            tradeType: newTrade.action === 'TRADE' ? newTrade.tradeType : null,
            timestamp: new Date(newTrade.timestamp).getTime() // Convert local time to epoch seconds
        };
        // Add logic here to update positions and history
        const date = new Date();
        createLogMutation.mutate(submittedTrade, {
            onSuccess: () => {
                setNewTrade({ item: null, action: 'TRADE', modifier: "CREATE", quantity: '', price: '', tradeType: 'BUY', timestamp: formatDateTimeForInput(date) });
                refetch(); // Refetch logs to update the history
            },
            onError: (error) => {
                alert(`Error creating log: ${error.message}`);
            }
        });
    };

    const handleDeleteSubmit = () => {
        const date = new Date();
        deleteLogMutation.mutate(selectedId, {
            onSuccess: () => {
                setNewTrade({ item: null, action: 'TRADE', modifier: "DELETE", quantity: '', price: '', tradeType: 'BUY', timestamp: formatDateTimeForInput(date) });
                refetch(); // Refetch logs to update the history
            },
            onError: (error) => {
                alert(`Error deleting log: ${error.message}`);
            }
        });
    }

    const [inputValue, setInputValue] = useState('');
    const debouncedInputValue = useDebounce(inputValue, 300);

    const levenshteinDistance = (a, b) => {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    };

    const retrieveAndRankOptions = useCallback((options, input) => {
        if (!options || !Array.isArray(options)) {
            return [];
        }

        const searchValue = typeof input === 'string' ? input.toLowerCase() : '';
        const searchTerms = searchValue.split(/\s+/);

        const retrieved = options.filter(option => {
            const nameLower = option.name.toLowerCase();
            const idString = option.id.toString();
            return searchTerms.every(term =>
                nameLower.includes(term) || idString.includes(term)
            );
        });

        const ranked = retrieved.map(option => {
            let score = 0;
            const nameLower = option.name.toLowerCase();
            const nameWords = nameLower.split(/\s+/);
            const idString = option.id.toString();

            // Exact match
            if (nameLower === searchValue || idString === searchValue) {
                score += 1000;
            }

            // Start of word matches
            searchTerms.forEach(term => {
                if (nameWords.some(word => word.startsWith(term))) {
                    score += 100;
                }
            });

            // Substring matches
            searchTerms.forEach(term => {
                if (nameLower.includes(term)) {
                    score += 50;
                }
            });

            // Fuzzy matching using Levenshtein distance
            const minDistance = Math.min(...nameWords.map(word => levenshteinDistance(searchValue, word)));
            score -= minDistance * 2;  // Penalize distance, but less severely

            // Prioritize shorter names when scores are close
            score -= option.name.length;

            return { ...option, score };
        });

        ranked.sort((a, b) => b.score - a.score);

        return ranked.slice(0, 8);
    }, []);

    useEffect(() => {
        if (itemMapping && debouncedInputValue !== undefined) {
            const rankedOptions = retrieveAndRankOptions(itemMapping, debouncedInputValue);
            setFilteredOptions(rankedOptions);
        } else {
            setFilteredOptions([]);
        }
    }, [itemMapping, debouncedInputValue, retrieveAndRankOptions]);


    const exportToCSV = () => {
        const csv = Papa.unparse(sortedItems);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        const currentDateTime = new Date().toLocaleString().replace(/[/,: ]/g, '_');
        saveAs(blob, `logs_${currentDateTime}.csv`);
    };

    const groupByItem = (trades) => {
        return trades.reduce((acc, trade) => {
            if (!acc[trade.item]) {
                acc[trade.item] = [];
            }
            acc[trade.item].push(trade);
            return acc;
        }, {});
    };

    const calculateRemainingQuantities = (groupedTrades) => {
        return Object.keys(groupedTrades).map(itemId => {
            const trades = groupedTrades[itemId];
            let remainingQuantity = 0;

            trades.forEach(trade => {
                if (trade.action === 'TRADE' && trade.tradeType === 'BUY') {
                    remainingQuantity += trade.quantity;
                } else if (trade.action === 'TRADE' && trade.tradeType === 'SELL') {
                    remainingQuantity -= trade.quantity;
                } else if (trade.action === 'PICKUP') {
                    remainingQuantity += trade.quantity;
                } else if (trade.action === 'DROP') {
                    remainingQuantity -= trade.quantity;
                }
            });

            // Ensure remaining quantity is not negative
            if (remainingQuantity < 0) {
                remainingQuantity = 0;
            }

            return {
                item: itemId,
                remainingQuantity,
                currentPrice: trades[0].currentPrice,
                name: itemMapping.find(thing => thing.id === parseInt(itemId)).name
            };
        });
    };

    const getItemById = id => itemMapping.find(thing => thing.id === parseInt(id));
    const groupedTrades = groupByItem(sortedItems);
    const positions = calculateRemainingQuantities(groupedTrades);

    if (mappingError || logsError) return <div>Error: {mappingError?.message || logsError?.message}</div>;
    return (
        <Box sx={{ p: 2, border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '4px', backgroundColor: 'transparent' }}>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>Transactions</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        {newTrade.modifier === 'CREATE' && (
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleSubmit}
                                sx={{
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    borderRadius: '4px',
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    },
                                }}
                            >
                                Submit
                            </Button>
                        )}
                        {newTrade.modifier === 'DELETE' && (
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleDeleteSubmit}
                                sx={{
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    borderRadius: '4px',
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    },
                                }}
                            >
                                Submit
                            </Button>
                        )}
                    </Box>
                </Grid>

            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        label="Modifier"
                        value={newTrade.modifier}
                        onChange={handleModifyChange}
                        fullWidth
                        required
                        InputLabelProps={{ style: { color: 'white' } }}
                        InputProps={{ style: { color: 'white' } }}
                        SelectProps={{
                            native: true,
                        }}
                    >
                        <option value="CREATE">Create</option>
                        <option value="DELETE">Delete</option>
                    </TextField>
                </Grid>
                {newTrade.modifier === 'CREATE' && (
                    <>
                        <Grid item xs={12} sm={newTrade.action === "TRADE" ? 3 : 6}>
                            <TextField
                                select
                                label="Action"
                                value={newTrade.action}
                                onChange={handleActionChange}
                                fullWidth
                                required
                                InputLabelProps={{ style: { color: 'white' } }}
                                InputProps={{ style: { color: 'white' } }}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value="TRADE">Trade</option>
                                <option value="PICKUP">Pickup</option>
                                <option value="DROP">Drop</option>
                            </TextField>
                        </Grid>
                        {newTrade.action === 'TRADE' && (
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    select
                                    label="Trade Type"
                                    value={newTrade.tradeType}
                                    onChange={(e) => setNewTrade({ ...newTrade, tradeType: e.target.value })}
                                    fullWidth
                                    required
                                    InputLabelProps={{ style: { color: 'white' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                    SelectProps={{
                                        native: true,
                                    }}
                                >
                                    <option value="BUY">Buy</option>
                                    <option value="SELL">Sell</option>
                                </TextField>
                            </Grid>
                        )}
                        <Grid item xs={12} sm={4}>
                            <Autocomplete
                                options={filteredOptions}
                                getOptionLabel={(option) => option.name}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Item"
                                        required
                                        InputLabelProps={{ style: { color: 'white' } }}
                                        InputProps={{
                                            ...params.InputProps,
                                            style: { color: 'white' },
                                            onChange: (e) => setInputValue(e.target.value)
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <ItemIcon
                                                src={`https://oldschool.runescape.wiki/images/${option.icon.replace(/ /g, '_')}`}
                                                alt={option.name}
                                                size={32}
                                            />
                                            <Typography sx={{ ml: 1 }}>{option.name}</Typography>
                                        </Box>
                                    </li>
                                )}
                                value={newTrade.item}
                                onChange={(event, newValue) => {
                                    setNewTrade({ ...newTrade, item: newValue });
                                }}
                                filterOptions={(x) => x}
                                onInputChange={(event, newInputValue) => {
                                    setInputValue(newInputValue);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Quantity"
                                type="text"
                                value={newTrade.quantity}
                                onChange={handleQuantityChange}
                                fullWidth
                                required
                                InputLabelProps={{ style: { color: 'white' } }}
                                InputProps={{ style: { color: 'white' } }}
                            />
                        </Grid>
                        {newTrade.action === 'TRADE' && (
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Item Cost"
                                    type="text"
                                    value={newTrade.price}
                                    onChange={handlePriceChange}
                                    fullWidth
                                    required
                                    InputLabelProps={{ style: { color: 'white' } }}
                                    InputProps={{ style: { color: 'white' } }}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} sm={12}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                // backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.23)',
                                p: .5,
                                pt: 1,
                                pb: 1,
                                borderRadius: '4px',
                                overflow: 'hidden',
                                width: '100%',
                            }}>
                                <input
                                    type="text"
                                    value={formatDisplayDateTime(newTrade.timestamp)}
                                    onClick={handleClick}
                                    readOnly
                                    style={{
                                        width: 'calc(100% - 40px)',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        padding: '10px',
                                        fontSize: '16px',
                                        outline: 'none',
                                        cursor: 'pointer',
                                    }}
                                />
                                <IconButton
                                    onClick={handleSetCurrentTime}
                                    size="small"
                                    sx={{
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                        padding: '4px',
                                    }}
                                >
                                    <AccessTimeIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Popover
                                id={id}
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handleClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                            >
                                <Box sx={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    padding: '16px',
                                    '& .react-calendar': {
                                        backgroundColor: 'transparent',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px', // Apply border-radius directly to the calendar
                                    },
                                    '& .react-calendar__tile': {
                                        color: 'white',
                                        border: 'none', // Remove default border
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: '4px',
                                        },
                                    },
                                    '& .react-calendar__tile--now': {
                                        backgroundColor: '#121212',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '4px',
                                    },
                                    '& .react-calendar__tile--active': {
                                        backgroundColor: '#121212 !important',
                                        border: '1px solid lime',
                                        borderRadius: '4px',
                                    },
                                    '& .react-calendar__tile--hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '4px',
                                    },
                                    '& .react-calendar__navigation button': {
                                        color: 'white',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '4px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                        '&:focus, &:active': {
                                            backgroundColor: '#121212',
                                            border: '1px solid gray',
                                        },
                                    },
                                    '& .react-calendar__navigation__prev-button, & .react-calendar__navigation__next-button': {
                                        color: 'white',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '4px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                        '&:focus, &:active': {
                                            backgroundColor: '#121212',
                                            border: '1px solid gray',
                                        },
                                    },
                                    '& .react-calendar__month-view__days__day--neighboringMonth': {
                                        color: 'rgba(255, 255, 255, 0.2)', // This line makes overflow days gray
                                    },
                                }}>
                                    <Box display="flex" justifyContent="flex-end" alignItems="center">
                                        <Button
                                            onClick={handleSetCurrentTime}
                                            size="small"
                                            sx={{
                                                color: 'white',
                                                fontSize: '10px',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                },
                                            }}
                                            endIcon={<AccessTimeIcon fontSize="small" />}
                                        >
                                            Set time to now
                                        </Button>
                                    </Box>
                                    <Calendar
                                        onChange={handleDateChange}
                                        value={new Date(newTrade.timestamp)}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        {[
                                            { type: 'hours', label: 'Hour', values: Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')) },
                                            { type: 'minutes', label: 'Minute', values: Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')) },
                                            { type: 'seconds', label: 'Second', values: Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')) },
                                            { type: 'ampm', label: 'AM/PM', values: ['AM', 'PM'] }
                                        ].map(({ type, label, values }) => (
                                            <FormControl key={type} sx={{ minWidth: 80 }}>
                                                <InputLabel sx={{ color: 'white' }}>{label}</InputLabel>
                                                <Select
                                                    value={
                                                        type === 'ampm'
                                                            ? (new Date(newTrade.timestamp).getHours() >= 12 ? 'PM' : 'AM')
                                                            : type === 'hours'
                                                                ? ((new Date(newTrade.timestamp).getHours() % 12) || 12).toString().padStart(2, '0')
                                                                : new Date(newTrade.timestamp)[`get${type.charAt(0).toUpperCase() + type.slice(1)}`]().toString().padStart(2, '0')
                                                    }
                                                    onChange={(e) => handleTimeChange(type, e.target.value)}
                                                    label={label}
                                                    sx={{
                                                        color: 'white',
                                                        '& .MuiSelect-icon': { color: 'white' },
                                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                                                    }}
                                                >
                                                    {values.map((num) => (
                                                        <MenuItem key={num} value={num}>{num}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        ))}
                                    </Box>
                                </Box>
                            </Popover>
                        </Grid>
                    </>)}
                {newTrade.modifier === 'DELETE' && (
                    <Grid item xs={12} sm={6}>
                        <Autocomplete
                            options={logs}
                            getOptionLabel={(option) => {
                                const item = itemMapping.find(thing => thing.id === parseInt(option.item));
                                return `${new Date(option.timestamp).toLocaleString()} Item: ${item ? item.name : 'Unknown'}, Action: ${option.action}, Quantity: ${option.quantity}, Price: ${option.price}`;
                            }}
                            renderInput={(params) => <TextField {...params} label="Choose" variant="outlined" />}
                            onChange={(event, newValue) => {
                                setSelectedId(newValue ? newValue.id : null)
                            }}
                        />
                    </Grid>
                )}
            </Grid>

            {/* Trade pages */}
            {paginatedItems.length > 0 && (<>
                <Divider sx={{ mt: 2 }} />
                <Box sx={{
                    display: { xs: 'flex', sm: 'flex' }, // Adjust display properties for responsiveness
                    alignItems: 'left',
                    justifyContent: 'left',
                    pt: 2,
                    mb: 2,
                    whiteSpace: 'nowrap', // Prevent text from wrapping
                }}>
                    <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>History</Typography>
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
            </>)}

            {/* Trade table */}
            {paginatedItems.length > 0 && (
                <TableContainer sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'transparent', height: "512px" }}>
                    <Table stickyHeader aria-label="trade history table">
                        <TableHead>
                            <TableRow>
                                <TableCell align='left' sx={{ bgcolor: 'transparent', color: 'white' }}>
                                    <ColoredSortLabel
                                        active={orderBy === 'timestamp'}
                                        direction={orderBy === 'timestamp' ? order : 'asc'}
                                        onClick={() => handleRequestSort('timestamp')}
                                    >
                                        Timestamp
                                    </ColoredSortLabel>
                                </TableCell>
                                <TableCell align='left' sx={{ bgcolor: 'transparent', color: 'white' }}>
                                    <ColoredSortLabel
                                        active={orderBy === 'action'}
                                        direction={orderBy === 'action' ? order : 'asc'}
                                        onClick={() => handleRequestSort('action')}
                                    >
                                        Action
                                    </ColoredSortLabel>
                                </TableCell>
                                <TableCell align='left' sx={{ bgcolor: 'transparent', color: 'white' }}>
                                    <ColoredSortLabel
                                        active={orderBy === 'item'}
                                        direction={orderBy === 'item' ? order : 'asc'}
                                        onClick={() => handleRequestSort('item')}
                                    >
                                        Item
                                    </ColoredSortLabel>
                                </TableCell>
                                <TableCell align='left' sx={{ bgcolor: 'transparent', color: 'white' }}>
                                    <ColoredSortLabel
                                        active={orderBy === 'quantity'}
                                        direction={orderBy === 'quantity' ? order : 'asc'}
                                        onClick={() => handleRequestSort('quantity')}
                                    >
                                        Quantity
                                    </ColoredSortLabel>
                                </TableCell>
                                <TableCell align='left' sx={{ bgcolor: 'transparent', color: 'white' }}>
                                    <ColoredSortLabel
                                        active={orderBy === 'price'}
                                        direction={orderBy === 'price' ? order : 'asc'}
                                        onClick={() => handleRequestSort('price')}
                                    >
                                        Unit Cost
                                    </ColoredSortLabel>
                                </TableCell>
                                <TableCell align='left' sx={{ bgcolor: 'transparent', color: 'white' }}>
                                    <ColoredSortLabel
                                        active={orderBy === 'amount'}
                                        direction={orderBy === 'amount' ? order : 'asc'}
                                        onClick={() => handleRequestSort('amount')}
                                    >
                                        Total Cost
                                    </ColoredSortLabel>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedItems.map((trade, index) => {
                                const zzz = itemMapping.find(thing => thing.id === parseInt(trade.item));
                                return (
                                    <TableRow
                                        key={trade?.id}
                                        hover
                                        onClick={() => navigateToItem(trade.item)}
                                        sx={{
                                            height: '50px',
                                            backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                                        }}
                                    >
                                        <TableCell
                                            title={new Date(trade.timestamp).toLocaleString()} // Tooltip to show full text on hover
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.87)',
                                                maxWidth: 0, // Ensures the cell can shrink, adjust as needed
                                                whiteSpace: 'nowrap', // Keeps the text in a single line
                                                overflow: 'hidden', // Hides overflow
                                                textOverflow: 'ellipsis', // Adds ellipsis to overflow
                                            }}
                                        >
                                            {new Date(trade.timestamp).toLocaleString()}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.87)',
                                                maxWidth: 0,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {trade.action === 'TRADE' ? `${trade.tradeType}` : trade.action}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.87)',
                                                maxWidth: 0,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {zzz ? zzz.name : 'Unknown Item'}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.87)',
                                                maxWidth: 0,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {trade.quantity?.toLocaleString() || 0}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.87)',
                                                maxWidth: 0,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {trade.price?.toLocaleString() || 0}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.87)',
                                                maxWidth: 0,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {trade.amount?.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Trade pages */}
            {paginatedItems.length > 0 && (
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
            )}


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

            <Grid item xs={12}>
                <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>Positions</Typography>
                {positions && positions.length > 0 ? (
                    <TableContainer sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'transparent', mb: 4 }}>
                        <Table stickyHeader aria-label="remaining quantity table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align='left' sx={{ bgcolor: 'transparent', color: 'white' }}>
                                        Item Name
                                    </TableCell>
                                    <TableCell align='left' sx={{ bgcolor: 'transparent', color: 'white' }}>
                                        Quantity
                                    </TableCell>
                                    <TableCell align='left' sx={{ bgcolor: 'transparent', color: 'white' }}>
                                        Current Price (ea)
                                    </TableCell>
                                    <TableCell align='left' sx={{ bgcolor: 'transparent', color: 'white' }}>
                                        Total
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {positions
                                    .filter(position => position.remainingQuantity > 0)
                                    .map((position, index) => (
                                        <TableRow
                                            key={index}
                                            hover
                                            sx={{
                                                height: '50px',
                                                backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                                            }}
                                        >
                                            <TableCell
                                                align="left"
                                                sx={{
                                                    color: 'rgba(255, 255, 255, 0.87)',
                                                    maxWidth: 0,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {position.name}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{
                                                    color: 'rgba(255, 255, 255, 0.87)',
                                                    maxWidth: 0,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {position.remainingQuantity?.toLocaleString() || 0}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{
                                                    color: 'rgba(255, 255, 255, 0.87)',
                                                    maxWidth: 0,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {position.currentPrice?.toLocaleString() || 0}
                                            </TableCell>
                                            {position.currentPrice && position.remainingQuantity && (
                                                <TableCell
                                                    align="left"
                                                    sx={{
                                                        color: 'rgba(255, 255, 255, 0.87)',
                                                        maxWidth: 0,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {position && position.currentPrice !== undefined && position.remainingQuantity !== undefined
                                                        ? (position.currentPrice * position.remainingQuantity).toLocaleString()
                                                        : "N/A"}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) :
                    <Typography
                        variant="caption"
                        sx={{
                            color: "white",
                            display: 'flex',
                            alignItems: 'center',
                            '@media (max-width: 500px)': {
                                textAlign: 'left'
                            }
                        }}
                    >You currently hold no positions. Record transactions above to see your positions.</Typography>
                }
            </Grid>

        </Box>
    );
};

export default RecordYourTrade;
