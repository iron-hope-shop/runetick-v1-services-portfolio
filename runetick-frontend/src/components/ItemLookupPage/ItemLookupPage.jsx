import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link, Chip, Box, Typography, Container, Grid, CircularProgress, Button, IconButton } from '@mui/material';
import { useRealtimePrices } from '../Hooks/useRealtimePrices';
import { motion } from 'framer-motion';
import { BuySellIndicator } from './BuySellIndicator';
import { PriceHistoryChart } from './PriceHistoryChart';
import { ChartOptions, CustomXAxis, CustomYAxis } from './ChartOptions';
import CombinedPriceTicker from './CombinedPriceTicker';
import DownloadIcon from '@mui/icons-material/Download';
import { useTimeseriesData } from '../Hooks/useTimeseriesData';
import { useLatestPrice } from '../Hooks/useLatestPrice';
// import { useAlchCost } from '../Hooks/useAlchCost';
import { LimitIndicator } from './LimitIndicator';
import { useLastTenChanges } from '../Hooks/useLastTenChanges';
import { useWatchlist } from '../Hooks/useWatchlist';
import { useWatchlistMutations } from '../Hooks/useWatchlistMutations';
import { useVolumes } from '../Hooks/useVolumes';
import { useItemMapping } from '../Hooks/useItemMapping';
import { useAuth } from '../AuthProvider/AuthProvider';
import { useNavigate } from 'react-router-dom';
import IosShareIcon from '@mui/icons-material/IosShare';
import CheckIcon from '@mui/icons-material/Check';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import { ItemIcon } from '../ItemIcon/ItemIcon'

const cardStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '4px',
  backgroundColor: 'transparent',
};

const chartTypes = [
  { id: 'price', name: 'Price', color: 'lime' },
  { id: 'volume', name: 'Volume', color: 'purple' },
  { id: 'rsi', name: 'RSI', color: 'blue' },
  { id: 'volatility', name: 'Volatility', color: 'orange' },
  { id: 'sma', name: 'SMA', color: 'aqua' },
  { id: 'ema', name: 'EMA', color: 'coral' },
  // { id: 'macd', name: 'MACD', color: 'deeppink' },
];

const ItemLookupPage = () => {
  const [searchParams] = useSearchParams();
  const [itemId, setItemId] = useState(null);
  const [formattedData, setFormattedData] = useState(null);
  const [interval, setInterval] = useState('24h');
  const [timespan, setTimespan] = useState('');
  const [chartView, setChartView] = useState('');
  const [numPoints, setNumPoints] = useState(365);
  const [isLoading, setIsLoading] = useState(false);
  // const { data: doNotDeleteThisPingsForHistoryCache = {} } = useRealtimePrices(); // DO NOT DELETE THIS LINE
  const { data: watchlistData = [] } = useWatchlist();
  const { data: lastTenChanges, isLoading: changesLoading, error: changesError } = useLastTenChanges();
  const [isAddDisabled, setIsAddDisabled] = useState(false); // State for disabling buttons
  const [isRemoveDisabled, setIsRemoveDisabled] = useState(false); // State for disabling buttons
  const { data: volumeData, isLoading: isVolumesLoading, error: volumesError } = useVolumes();
  const [selectedCharts, setSelectedCharts] = useState(['price', 'volatility']);
  const { data: itemMappingData } = useItemMapping();
  const [selectedItem, setSelectedItem] = useState(null);
  const { addItemMutation, removeItemMutation } = useWatchlistMutations();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleFormattedData = (data) => {
    setFormattedData(data);
  };

  

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Revert back after 2 seconds
    });
  };

  useEffect(() => {
    const newItemId = searchParams.get('id');
    if (newItemId !== itemId) {
      setItemId(newItemId);
    }
  }, [searchParams, itemId]);


  useEffect(() => {
    if (itemMappingData && itemId) {
      const item = itemMappingData.find(thing => thing.id === parseInt(itemId));
      setSelectedItem(item);
    }
  }, [itemMappingData, itemId]);


  useEffect(() => {
    setIsAddDisabled(false);
    setIsRemoveDisabled(false);
  }, [watchlistData]);

  const selectedItemId = selectedItem?.id;

  const {
    data: latestPriceData,
    isLoading: isLatestPriceLoading,
    error: latestPriceError
  } = useLatestPrice(selectedItemId ? selectedItemId : null);

  const {
    data: timeseriesData,
    isLoading: isTimeseriesLoading,
    error: timeseriesError
  } = useTimeseriesData(selectedItemId && interval ? selectedItemId : null, interval);

  // const {
  //   data: alchCostData,
  //   isLoading: isAlchCostLoading,
  //   error: alchCostError
  // } = useAlchCost();

  const toggleChart = (chartId) => {
    setSelectedCharts(prev =>
      prev.includes(chartId) ? prev.filter(id => id !== chartId) : [...prev, chartId]
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsAddDisabled(false);
    setIsRemoveDisabled(false);
  }, [selectedItem]);

  // const calculateAlchProfit = () => {
  //   if (latestPriceData && alchCostData && selectedItem.highalch) {
  //     const alchValue = selectedItem.highalch;
  //     const itemCost = latestPriceData.lastPrice;
  //     const alchCost = alchCostData.alchCost;
  //     const profit = alchValue - itemCost - alchCost;
  //     return profit;
  //   }
  //   return null;
  // };

  // const alchProfit = calculateAlchProfit();

  // Calculate percentage change
  const calculatePercentChange = () => {
    if (latestPriceData) {
      const { lastPrice, highPrice, lowPrice } = latestPriceData;
      const prevPrice = latestPriceData.isDown ? highPrice : lowPrice;
      return ((lastPrice - prevPrice) / prevPrice * 100).toFixed(2);
    }
    return null;
  };

  const percentChange = calculatePercentChange();

  const handleAddItem = (itemId) => {
    setIsAddDisabled(true); // Disable the button
    addItemMutation.mutate({ itemId }, {
      onSuccess: () => {
        setIsRemoveDisabled(false);
      },
      onError: () => {
        setIsRemoveDisabled(false);
      }
    });
    
  };
  
  const handleRemoveItem = (itemId) => {
    setIsRemoveDisabled(true); // Disable the button
    removeItemMutation.mutate({ itemId }, {
      onSuccess: () => {
        setIsAddDisabled(false);
      },
      onError: () => {
        setIsAddDisabled(false);
      }
    });
    setIsAddDisabled(false)
  };

  // Transform timeseriesData.data from object to array
  const transformedData = timeseriesData ? Object.entries(timeseriesData.data).map(([timestamp, values]) => ({
    timestamp: parseInt(timestamp, 10),
    ...values
  })) : [];

  if (changesLoading || isLatestPriceLoading || isTimeseriesLoading || isVolumesLoading) { return <LoadingScreen />; }

  const exportToCSV = () => {
    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const currentDateTime = new Date().toLocaleString().replace(/[/,: ]/g, '_');
    saveAs(blob, `zzz${interval}_${numPoints}_datapoints_${currentDateTime}.csv`);
  };


  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#121212' }}>
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        {selectedItem && transformedData && timeseriesData && itemId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={cardStyle}>
                  <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {selectedItem.icon && selectedItem.name ?
                            <ItemIcon
                            key={selectedItem.id}
                              src={`https://oldschool.runescape.wiki/images/${selectedItem.icon.replace(/ /g, '_')}`}
                              alt={selectedItem.name}
                            /> :
                            <ItemIcon
                            key={selectedItem.id}
                              src={'https://oldschool.runescape.wiki/images/Bank_note.png'}
                              alt={selectedItem.name}
                            />
                          }
                          <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 'bold',
                                transition: 'color 0.3s ease-in-out',
                              }}>
                              {selectedItem.name}
                            </Typography>
                            {isLatestPriceLoading ? (
                              <CircularProgress size={20} />
                            ) : latestPriceError ? (
                              <Typography color="error">Error loading latest price</Typography>
                            ) : (
                              latestPriceData ? <Box display="flex">
                                <LimitIndicator lim={selectedItem.limit} />
                                {/* <BuySellIndicator recommendation={latestPriceData.isDown ? 'BUY' : 'SELL'} /> */}
                              </Box> : "??"
                            )}
                          </Box>
                        </Box>

                        {selectedItem && (<Box sx={{
                          display: 'grid',
                          alignItems: 'start',
                          mt: 2, // Added margin-top for spacing
                        }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">{selectedItem?.examine}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary" style={{ display: 'inline', color: selectedItem.members ? 'red' : 'lime', }}>
                                Member's Item: {selectedItem.members ? 'Yes' : 'No'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="yellow">Item ID: {selectedItem?.id}</Typography>
                            </Box>
                            {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                              {volumeData && ("High Price Volume (24hrs): " + parseInt(volumeData[selectedItem?.highPriceVolume] || 0).toLocaleString() + " units")}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                              {volumeData && ("Low Price Volume (24hrs): " + parseInt(volumeData[selectedItem?.lowPriceVolume] || 0).toLocaleString() + " units")}
                              </Typography>
                            </Box> */}
                          </Box>
                        </Box>)}
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        {isLatestPriceLoading ? (
                          <CircularProgress size={20} />
                        ) : latestPriceError ? (
                          <Typography color="error">Error loading data</Typography>
                        ) : (
                          <CombinedPriceTicker
                            id={selectedItem?.id}
                            cahnges={lastTenChanges}
                            changesLoading={changesLoading}
                            changesError={changesError}
                            percentChange={latestPriceData?.percentChange}
                            currentPrice={latestPriceData?.lastPrice}
                            previousPrice={latestPriceData?.isDown ? latestPriceData?.highPrice : latestPriceData?.lowPrice}
                            highAlch={selectedItem?.highalch}
                          />
                        )}
                      </Box>
                    </Box>

                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      mt: 2
                    }}>
                      {
                        !isLatestPriceLoading && selectedItem && watchlistData?.includes(selectedItem.id) ? (
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleRemoveItem(selectedItem.id)}
                            disabled={isRemoveDisabled}
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

                            {isRemoveDisabled ? "Please wait..." : "Remove from Watchlist"}
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleAddItem(selectedItem.id)}
                            disabled={isAddDisabled}
                            sx={{
                              // mr: 2,
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              borderRadius: '4px',
                              backgroundColor: 'transparent',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              },
                            }}
                          >
                            {isAddDisabled ? "Please wait..." : "Add to Watchlist"}
                          </Button>
                        )
                      }

                      <IconButton
                        variant="outlined"
                        color="primary"
                        onClick={handleCopyUrl}
                        sx={{
                          ml: 2,
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '4px',
                          backgroundColor: 'transparent',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          },
                        }}
                      >
                        {copied ? <CheckIcon /> : <IosShareIcon />}
                      </IconButton>
                      {/* <Button
                    variant="outlined"
                    color="primary"
                    onClick={onBackToDashboard}
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
                    Back
                  </Button> */}
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      mt: 2
                    }}>
                      <a
                        href={`https://secure.runescape.com/m=itemdb_oldschool/Jute+seed/viewitem?obj=${selectedItem.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: 'none',
                          display: 'inline-block',
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="primary"
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
                          View on GE
                        </Button>
                      </a>
                      <a
                        href={`https://oldschool.runescape.wiki/w/${selectedItem.name.replace(/ /g, '_')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: 'none',
                          display: 'inline-block',
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="primary"
                          sx={{
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '4px',
                            backgroundColor: 'transparent',
                            color: 'white',
                            ml: 2,
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            },
                          }}
                        >
                          View on Wiki
                        </Button>
                      </a>
                      {/* <Button
                    variant="outlined"
                    color="primary"
                    onClick={onBackToDashboard}
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
                    Back
                  </Button> */}
                    </Box>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={12} sx={{ mt: -3 }}>
                {/* <Box sx={cardStyle}> */}
                <Box sx={{ bgcolor: 'background.default' }}>
                  {/* </Box> */}
                  <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 2, minHeight: 700 * selectedCharts.length }}>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} sm={12}>
                        <Typography variant="h6" sx={{ color: 'white' }}>Technical Indicators</Typography>
                      </Grid>

                      <Grid item xs={10} sm={10}>
                        <Box sx={{}}>
                          <ChartOptions
                            interval={interval}
                            setInterval={setInterval}
                            timespan={timespan}
                            setTimespan={setTimespan}
                            chartView={chartView}
                            setChartView={setChartView}
                            numPoints={numPoints}
                            setNumPoints={setNumPoints}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={2} sm={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', }}>
                          <IconButton
                            color="primary"
                            onClick={exportToCSV}
                            disabled={true}
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
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{
                          display: 'flex', flexWrap: 'wrap', justifyContent: "flex-start", gap: 1, mb: {
                            xs: 4, // Default value for extra-small screens
                            sm: 6,    // Value for small screens and up
                          },
                        }}>
                          {chartTypes.map(chart => (
                            <Chip
                              key={chart.id}
                              label={chart.name}
                              onClick={() => toggleChart(chart.id)}
                              color={selectedCharts.includes(chart.id) ? 'primary' : 'default'}
                              variant={selectedCharts.includes(chart.id) ? 'outlined' : 'outlined'}
                              sx={{
                                width: '80px',
                                borderColor: selectedCharts.includes(chart.id) ? chart.color : 'gray',
                                color: selectedCharts.includes(chart.id) ? 'white' : 'gray',
                                bgcolor: selectedCharts.includes(chart.id) ? 'transparent' : 'transparent',
                                '&:hover': {
                                  bgcolor: selectedCharts.includes(chart.id) ? chart.color : 'rgba(255, 255, 255, 0.08)',
                                },
                                '& .MuiChip-label': {
                                  fontWeight: selectedCharts.includes(chart.id) ? 'bold' : 'normal',
                                },
                                transition: 'all 0.3s',
                                boxShadow: selectedCharts.includes(chart.id) ? `0 0 10px ${chart.color}` : 'none',
                              }}
                            />
                          ))}
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        {isTimeseriesLoading ? (
                          <CircularProgress />
                        ) : timeseriesError ? (
                          <Typography color="error">Error loading data: {timeseriesError.message}</Typography>
                        ) : transformedData.length > 0 ? (
                          <>
                            <PriceHistoryChart
                              data={transformedData.slice(-numPoints)}
                              setFormattedData={setFormattedData}
                              name={selectedItem?.name}
                              CustomXAxis={CustomXAxis}
                              CustomYAxis={CustomYAxis}
                              selectedCharts={selectedCharts}
                              onFormattedData={handleFormattedData}
                            />
                          </>
                        ) : null}
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Grid>
              {/* <Grid item xs={12}>
                <Box sx={cardStyle}>
                  <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, height: '100%' }}>
                  <TechnicalIndicators data={transformedData} interval={interval} numPoints={numPoints} />
                  </Box>
                </Box>
              </Grid> */}
              {/* <Grid item xs={12}>
                <Box sx={cardStyle}>
                  <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, height: '100%' }}>
                    <NewsList news={mockNews} />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={cardStyle}>
                  <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, height: '100%' }}>
                    <BuySellCalculator item={selectedItem} latestPrice={latestPriceData?.lastPrice} />
                  </Box>
                </Box>
              </Grid> */}
            </Grid>
          </motion.div>
        )}
      </Container>
    </Box>
  );
};

export default ItemLookupPage;