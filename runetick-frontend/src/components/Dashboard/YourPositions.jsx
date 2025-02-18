import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, Divider, TableHead, TableRow, TextField, Grid, Autocomplete, IconButton, Popover, Select, MenuItem, FormControl, InputLabel, TableSortLabel, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { ItemIcon } from '../ItemIcon/ItemIcon';
import { useDebounce } from '../Hooks/useDebounce';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useUserLogMutations } from '../Hooks/useUserLogMutations';
import { useUserLogs } from '../Hooks/useUserLogs';
import { useItemMapping } from '../Hooks/useItemMapping';
import { ArrowBack, ArrowForward, FirstPage, LastPage } from '@mui/icons-material';
import { useRealtimePrices } from '../Hooks/useRealtimePrices';
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts';

function processTransactions(transactions) {
    let inventory = {};
    let coins = 0;
    let totalProfit = 0;
    let positions = [];
  
    transactions.forEach(transaction => {
      const { item, action, quantity, price, tradeType, currentPrice, timestamp } = transaction;
  
      if (!inventory[item]) {
        inventory[item] = { quantity: 0, cost: 0 };
      }
  
      switch (action) {
        case 'TRADE':
          if (tradeType === 'BUY') {
            inventory[item].quantity += quantity;
            inventory[item].cost += quantity * price;
            coins -= quantity * price;
          } else if (tradeType === 'SELL') {
            if (inventory[item].quantity >= quantity) {
              const costPerItem = inventory[item].cost / inventory[item].quantity;
              inventory[item].quantity -= quantity;
              inventory[item].cost -= costPerItem * quantity;
              coins += quantity * price;
              totalProfit += quantity * (price - costPerItem);
            } else {
              console.warn(`Selling more than available for item ${item}`);
              coins += quantity * price;
              totalProfit += quantity * (price - currentPrice);
            }
          }
          break;
        case 'PICKUP':
          inventory[item].quantity += quantity;
          totalProfit += quantity * currentPrice;
          break;
        case 'DROP':
          if (inventory[item].quantity >= quantity) {
            const costPerItem = inventory[item].cost / inventory[item].quantity;
            inventory[item].quantity -= quantity;
            inventory[item].cost -= costPerItem * quantity;
            totalProfit -= quantity * currentPrice;
          } else {
            console.warn(`Dropping more than available for item ${item}`);
            totalProfit -= quantity * currentPrice;
          }
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
  
      // Record the position after each transaction
      positions.push({
        timestamp,
        coins,
        totalProfit,
        inventory: JSON.parse(JSON.stringify(inventory)) // Deep copy to preserve state
      });
    });
  
    return positions;
  }

const YourPositions = ({ onItemSelect }) => {
    const { data: logs, isLoading: logsLoading, error: logsError, refetch } = useUserLogs();
    const { data: itemMapping, isLoading: mappingLoading, error: mappingError } = useItemMapping();
    const { data: realtimePrices, isLoading: realtimePricesLoading, error: realtimePricesError } = useRealtimePrices();

    // pagination
    const chartRef = useRef(null);
    const [sortedItems, setSortedItems] = useState([]);
    const [orderBy, setOrderBy] = useState('timestamp');
    const [order, setOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [inputPage, setInputPage] = useState('1');
    const itemsPerPage = 8;
    const [selectedId, setSelectedId] = useState(null);
    const [chartHeight, setChartHeight] = useState(300);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [filteredOptions, setFilteredOptions] = useState([]);

    useEffect(() => {
        const updateChartHeight = () => {
            const width = chartRef.current?.container.clientWidth || 0;
            setChartHeight(Math.max(300, width * 0.5));
        };

        updateChartHeight();
        window.addEventListener('resize', updateChartHeight);
        return () => window.removeEventListener('resize', updateChartHeight);
    }, []);

    useEffect(() => {
        if (logs && itemMapping) {
            const entries = Object.entries(logs).map(([id, log]) => ({
                id,
                ...log,
                amount: (log.quantity || 0) * (log.price || 0),
                currentPrice: realtimePrices[log.item].highTime > realtimePrices[log.item].lowTime ? realtimePrices[log.item].high : realtimePrices[log.item].low,
                profit: (realtimePrices[log.item].highTime > realtimePrices[log.item].lowTime ? realtimePrices[log.item].high : realtimePrices[log.item].low) - log.price,
            }));
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

    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const formatYAxis = (tickItem) => {
        if (tickItem >= 1000000000) {
            return `${(tickItem / 1000000000).toFixed(1)}B`;
        } else if (tickItem >= 1000000) {
            return `${(tickItem / 1000000).toFixed(1)}M`;
        } else if (tickItem >= 1000) {
            return `${(tickItem / 1000).toFixed(1)}K`;
        }
        return `${tickItem.toLocaleString()}`;
    };

    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem * 1000);
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };



    const getItemById = id => itemMapping.find(thing => thing.id === parseInt(id));
    const positions = processTransactions(sortedItems);
    console.table(positions);

    if (mappingError || logsError) return <div>Error: {mappingError?.message || logsError?.message}</div>;
    return (
        <Box sx={{ p: 2, border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '4px', backgroundColor: 'transparent' }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                    <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 3 }}>cool graph</Typography>
                </Grid>
                <Grid item xs={6}>
                    {sortedItems ? sortedItems.map((item, index) => (
                        <div key={index}>
                            <div>Item: {JSON.stringify(item)}</div>
                            {/* <div>Item: {item.item}</div>
                            <div>Action: {item.action}</div>
                            <div>Modifier: {item.modifier}</div>
                            <div>Quantity: {item.quantity}</div>
                            <div>Price: ${item.price.toLocaleString()}</div>
                            <div>Trade Type: {item.tradeType}</div>
                            <div>Timestamp: {new Date(item.timestamp).toLocaleString()}</div> */}
                        </div>
                    )) : ""}
                </Grid>
            </Grid>


        </Box>
    );
};

export default YourPositions;
