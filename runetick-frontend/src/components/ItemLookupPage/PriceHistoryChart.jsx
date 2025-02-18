import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Box, Divider, Tooltip, Typography, IconButton, Button, useTheme, useMediaQuery } from "@mui/material";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, ReferenceLine, XAxis, YAxis, Bar, ComposedChart, Tooltip as RechartsTooltip, Legend, BarChart } from "recharts";
import { styled } from '@mui/system';

const calculateRSI = (data, period = 14) => {
  // Filter out data points with invalid prices
  const validData = data.filter(d => d.price !== null && d.price !== undefined && d.price > 0);

  if (validData.length < period + 1) {
    console.warn("Not enough valid data to calculate RSI");
    return data.map(d => ({ ...d, rsi: null }));
  }

  let gains = [];
  let losses = [];

  // Calculate initial average gain and loss
  for (let i = 1; i < period + 1; i++) {
    const change = validData[i].price - validData[i - 1].price;
    if (change >= 0) {
      gains.push(change);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(change));
    }
  }

  let avgGain = gains.reduce((sum, gain) => sum + gain, 0) / period;
  let avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / period;

  return data.map((d, index) => {
    if (index < period || !validData[index] || !validData[index - 1]) {
      return { ...d, rsi: null };
    }

    const change = validData[index].price - validData[index - 1].price;
    const currentGain = change >= 0 ? change : 0;
    const currentLoss = change < 0 ? Math.abs(change) : 0;

    // Use smoothed averages
    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return { ...d, rsi: parseFloat(rsi.toFixed(2)) };
  });
};

const calculateVolatility = (data, period = 14) => {
  // Filter out data points with invalid prices
  const validData = data.filter(d => d.price !== null && d.price !== undefined && d.price > 0);

  if (validData.length < period + 1) {
    console.warn("Not enough valid data to calculate volatility");
    return data.map(d => ({ ...d, volatility: null }));
  }

  // Calculate log returns
  const logReturns = validData.slice(1).map((d, i) => Math.log(d.price / validData[i].price));

  return data.map((d, index) => {
    if (index < period || !validData[index]) {
      return { ...d, volatility: null };
    }

    const periodReturns = logReturns.slice(Math.max(0, index - period), index);
    const meanReturn = periodReturns.reduce((sum, r) => sum + r, 0) / periodReturns.length;
    const squaredDifferences = periodReturns.map(r => Math.pow(r - meanReturn, 2));
    const variance = squaredDifferences.reduce((sum, sd) => sum + sd, 0) / (periodReturns.length - 1);
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility

    return { ...d, volatility: parseFloat(volatility.toFixed(4)) };
  });
};

const GlassTooltip = styled('div')({
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  borderRadius: '8px',
  padding: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  color: 'white'
});

const ChartContainer = styled('div')({
  width: '100%',
  height: '100%',
  minHeight: '300px',
  display: 'flex',
  flexDirection: 'column'
});

const formatPrice = (price) => {
  return `${price.toLocaleString()} gp`;
};

const formatVolume = (volume) => {
  return `${volume.toLocaleString()} units`;
};

const calculateDomain = (data, keys, margin = 0.1) => {
  const allValues = data.flatMap(item => keys.map(key => item[key])).filter(value => value !== undefined && value !== null);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min;
  return [
    Math.max(0, min - range * margin), // Ensure the lower bound is not negative
    max + range * margin
  ];
};

const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const PriceTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <GlassTooltip>
        <Typography variant="subtitle2" color="text.secondary">
          {`Date: ${formatDate(data.timestamp)}`}
        </Typography>
        <Typography variant="body2" color="text.primary">
          HIGH PRICE: <strong>{formatPrice(data.avgHighPrice ?? 0)}</strong>
        </Typography>
        <Typography variant="body2" color="text.primary">
          LOW PRICE: <strong>{formatPrice(data.avgLowPrice ?? 0)}</strong>
        </Typography>
        <Typography variant="body2" color="text.primary">
          PRICE DIFF: <strong>{formatPrice((data?.avgHighPrice || 0) - (data?.avgLowPrice || 0))}</strong>
        </Typography>
        <Divider sx={{ mt: 1, mb: 1 }} />
        <Typography variant="body2" color="text.primary">
          HIGH VOL: <strong>{formatVolume(data.highPriceVolume ?? 0)}</strong>
        </Typography>
        <Typography variant="body2" color="text.primary">
          LOW VOL: <strong>{formatVolume(data.lowPriceVolume ?? 0)}</strong>
        </Typography>
      </GlassTooltip>
    );
  }
  return null;
};

export const SMATooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <GlassTooltip>
        <Typography variant="subtitle2" color="text.secondary">
          {`Date: ${formatDate(data.timestamp)}`}
        </Typography>
        <Typography variant="body2" color="text.primary">
          PRICE: <strong>{formatPrice(data.price ?? 0)}</strong>
        </Typography>
        <Typography variant="body2" color="text.primary">
          SMA 14: <strong>{formatPrice(data.sma14 ?? 0)}</strong>
        </Typography>
        <Typography variant="body2" color="text.primary">
          SMA 50: <strong>{formatPrice(data.sma50 ?? 0)}</strong>
        </Typography>
      </GlassTooltip>
    );
  }
  return null;
};

export const EMATooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <GlassTooltip>
        <Typography variant="subtitle2" color="text.secondary">
          {`Date: ${formatDate(data.timestamp)}`}
        </Typography>
        <Typography variant="body2" color="text.primary">
          PRICE: <strong>{formatPrice(data.price ?? 0)}</strong>
        </Typography>
        <Typography variant="body2" color="text.primary">
          EMA 12: <strong>{formatPrice(data.ema12 ?? 0)}</strong>
        </Typography>
        <Typography variant="body2" color="text.primary">
          EMA 26: <strong>{formatPrice(data.ema26 ?? 0)}</strong>
        </Typography>
      </GlassTooltip>
    );
  }
  return null;
};

export const MACDTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Find the MACD, Signal, and Histogram data
    const macdData = payload.find(p => p.dataKey === 'macd');
    const signalData = payload.find(p => p.dataKey === 'signal');
    const histogramData = payload.find(p => p.dataKey === 'histogram');

    // Use the first payload item for common data like timestamp
    const data = payload[0].payload;

    return (
      <GlassTooltip>
        <Typography variant="subtitle2" color="text.secondary">
          {`Date: ${formatDate(data.timestamp)}`}
        </Typography>
        <Typography variant="body2" color="text.primary">
          MACD: <strong>{macdData ? macdData.value.toFixed(4) : 'N/A'}</strong>
        </Typography>
        <Typography variant="body2" color="text.primary">
          SIGNAL: <strong>{signalData ? signalData.value.toFixed(4) : 'N/A'}</strong>
        </Typography>
        <Typography variant="body2" color="text.primary">
          HISTOGRAM: <strong>{histogramData ? histogramData.value.toFixed(4) : 'N/A'}</strong>
        </Typography>
      </GlassTooltip>
    );
  }
  return null;
};

export const RSITooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <GlassTooltip>
        <Typography variant="subtitle2" color="text.secondary">
          {`Date: ${formatDate(data.timestamp)}`}
        </Typography>
        <Typography variant="body2" color="text.primary">
          RSI: <strong>{data.rsi?.toFixed(2) ?? 'N/A'}</strong>
        </Typography>
      </GlassTooltip>
    );
  }
  return null;
};

export const VolatilityTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <GlassTooltip>
        <Typography variant="subtitle2" color="text.secondary">
          {`Date: ${formatDate(data.timestamp)}`}
        </Typography>
        <Typography variant="body2" color="text.primary">
          VOLATILITY: <strong>{(data.volatility * 100).toFixed(2)}%</strong>
        </Typography>
      </GlassTooltip>
    );
  }
  return null;
};

export const PriceHistoryChart = ({ data, name, selectedCharts, onFormattedData }) => {
  const chartRef = useRef(null);
  const [hiddenSeries, setHiddenSeries] = useState([]);
  const [chartHeight, setChartHeight] = useState(300);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const updateChartHeight = () => {
      const width = chartRef.current?.container.clientWidth || 0;
      setChartHeight(Math.max(300, width * 0.5));
    };

    updateChartHeight();
    window.addEventListener('resize', updateChartHeight);
    return () => window.removeEventListener('resize', updateChartHeight);
  }, []);

  const formatData = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("Invalid or empty data provided");
      return [];
    }

    const formattedData = data.map((d, index) => {
      const avgLowPrice = d.avgLowPrice ?? 0;
      const avgHighPrice = d.avgHighPrice ?? 0;
      const filledAvgLowPrice = avgLowPrice || avgHighPrice;
      const filledAvgHighPrice = avgHighPrice || avgLowPrice;
      const price = filledAvgLowPrice || filledAvgHighPrice;

      return {
        date: new Date(d.timestamp * 1000).toLocaleString(),
        price: price > 0 ? price : null,
        avgLowPrice: filledAvgLowPrice,
        avgHighPrice: filledAvgHighPrice,
        highPriceVolume: d.highPriceVolume ?? 0,
        lowPriceVolume: d.lowPriceVolume ?? 0,
        timestamp: d.timestamp,
      };
    });

    const dataWithRSI = calculateRSI(formattedData);
    const dataWithVolatility = calculateVolatility(dataWithRSI);

    // Calculate SMA
    const smaShort = calculateSMA(dataWithVolatility, 14);
    const smaLong = calculateSMA(dataWithVolatility, 50);

    // Calculate EMA
    const emaShort = calculateEMA(dataWithVolatility, 12);
    const emaLong = calculateEMA(dataWithVolatility, 26);

    // Calculate MACD
    const dataWithMACD = calculateMACD(dataWithVolatility);

    // Combine all data
    const finalData = dataWithMACD.map((d, i) => ({
      ...d,
      sma14: smaShort[i].sma,
      sma50: smaLong[i].sma,
      ema12: emaShort[i].ema,
      ema26: emaLong[i].ema,
    }));

    return finalData;
  };

  // SMA calculation function
  const calculateSMA = (data, period, key = 'price') => {
    return data.map((_, index, array) => {
      if (index < period - 1) {
        return { ...array[index], sma: null };
      }

      const sum = array.slice(index - period + 1, index + 1)
        .reduce((acc, val) => acc + (val[key] || 0), 0);

      const sma = sum / period;
      return { ...array[index], sma: parseFloat(sma.toFixed(2)) };
    });
  };

  // EMA calculation function
  const calculateEMA = (data, period, key = 'price') => {
    const k = 2 / (period + 1);

    return data.reduce((acc, point, index) => {
      if (index < period - 1) {
        acc.push({ ...point, ema: null });
      } else if (index === period - 1) {
        const sma = acc.slice(0, period).reduce((sum, p) => sum + (p[key] || 0), 0) / period;
        acc.push({ ...point, ema: parseFloat(sma.toFixed(2)) });
      } else {
        const prevEMA = acc[index - 1].ema;
        const ema = (point[key] - prevEMA) * k + prevEMA;
        acc.push({ ...point, ema: parseFloat(ema.toFixed(2)) });
      }
      return acc;
    }, []);
  };

  // MACD calculation function
  const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9, key = 'price') => {
    // Calculate fast and slow EMAs
    const calculateEMA = (data, period) => {
      const k = 2 / (period + 1);
      let ema = data[0][key];
      return data.map((point, i) => {
        if (i === 0) return ema;
        ema = (point[key] - ema) * k + ema;
        return ema;
      });
    };

    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);

    // Calculate MACD line
    const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);

    // Calculate signal line (EMA of MACD line)
    const signalLine = (() => {
      const k = 2 / (signalPeriod + 1);
      let ema = macdLine[0];
      return macdLine.map((macd, i) => {
        if (i === 0) return null;
        ema = (macd - ema) * k + ema;
        return ema;
      });
    })();

    // Calculate MACD histogram
    const histogram = macdLine.map((macd, i) => macd - (signalLine[i] || 0));

    // Combine all data
    return data.map((point, i) => ({
      ...point,
      macd: parseFloat(macdLine[i]?.toFixed(4) ?? null),
      signal: parseFloat(signalLine[i]?.toFixed(4) ?? null),
      histogram: parseFloat(histogram[i]?.toFixed(4) ?? null)
    }));
  };

  const formattedData = useMemo(() => formatData(data), [data]);

  const calculateAvgPercentChange = (data) => {
    if (!Array.isArray(data) || data.length < 2) {
      console.warn("Insufficient data to calculate percent change");
      return null;
    }

    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;

    if (firstPrice === null || lastPrice === null) {
      console.warn("Invalid price data for calculation");
      return null;
    }

    const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    return percentChange;
  };

  const avgPercentChange = calculateAvgPercentChange(formattedData);

  // Calculate domains
  const priceDomain = calculateDomain(formattedData, ['avgLowPrice', 'avgHighPrice']);
  const volumeDomain = calculateDomain(formattedData, ['highPriceVolume', 'lowPriceVolume']);

  const dataValidity = useMemo(() => ({
    price: formattedData.some(d => d.avgLowPrice > 0 || d.avgHighPrice > 0),
    volume: formattedData.some(d => d.highPriceVolume > 0 || d.lowPriceVolume > 0),
    rsi: formattedData.some(d => d.rsi !== null && d.rsi !== undefined),
    volatility: formattedData.some(d => d.volatility !== null && d.volatility !== undefined)
  }), [formattedData]);

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

  const calculateInterval = (dataLength) => {
    return Math.ceil(dataLength / (isMobile ? 4 : 8));
  };

  const handleLegendClick = (e) => {
    const { dataKey } = e;
    setHiddenSeries(prev =>
      prev.includes(dataKey)
        ? prev.filter(key => key !== dataKey)
        : [...prev, dataKey]
    );
  };

  const getMargin = () => {
    if (isMobile) {
      return { top: 0, right: 20, left: 20, bottom: 20 };
    }
    return { top: 0, right: 48, left: 48, bottom: 32 };
  };

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={chartHeight}>
        {selectedCharts.includes("price") ? (
          dataValidity.price ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2em' }}>
              <span>Price of {name}</span>
              <span style={{ color: avgPercentChange >= 0 ? 'lime' : 'red' }}>
                {`(${avgPercentChange >= 0 ? '+' : ''}${parseFloat(avgPercentChange).toFixed(2)}%)`}
              </span>
            </div>
          ) : (
            <>Increase data points to calculate price.<br /></>
          )
        ) : ""}
        {selectedCharts.includes("price") && dataValidity.price && (
          <LineChart
            data={formattedData}
            ref={chartRef}
            margin={getMargin()}
            dot={false}
          >
            <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="1 2" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              interval={calculateInterval(formattedData.length)}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              label={isMobile ? null : { value: "Time", position: 'insideBottom', dy: 20 }}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={formatYAxis}
              label={isMobile ? null : { value: "Price (gp)", angle: -90, position: 'insideLeft', dy: 30, dx: -32 }}
              domain={priceDomain}
            />
            <RechartsTooltip content={<PriceTooltip selectedCharts={selectedCharts} />} />
            <Legend
              verticalAlign={isMobile ? "bottom" : "top"}
              height={36}
              onClick={handleLegendClick}
              wrapperStyle={isMobile ? { position: 'relative', marginTop: '-48px' } : null}
            />
            <Line
              yAxisId="left"
              dataKey="avgHighPrice"
              stroke="lime"
              dot={false}
              hide={hiddenSeries.includes('avgHighPrice')}
            // type="monotone" 
            // strokeDasharray="1 1"
            />
            <Line
              yAxisId="left"
              dataKey="avgLowPrice"
              stroke="red"
              dot={false}
              hide={hiddenSeries.includes('avgLowPrice')}
            // strokeDasharray="3 4 5 2"
            />
          </LineChart>
        )}

        {/* <Divider sx={{ mt: 6, mb: 6 }} /> */}


        {selectedCharts.includes("volume") ? dataValidity.volume ? `Volume Traded` : <>Increase data points to calculate volume.<br></br></> : ""}
        {selectedCharts.includes("volume") && dataValidity.volume && (
          <BarChart
            width={500}
            height={300}
            data={data}
            ref={chartRef}
            margin={getMargin()}
            dot={false}
          >
            <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="1 2" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              interval={calculateInterval(formattedData.length)}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              label={isMobile ? null : { value: "Time", position: 'insideBottom', dy: 20 }}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={formatYAxis}
              label={isMobile ? null : { value: "Volume (unit)", angle: -90, position: 'insideLeft', dy: 30, dx: -32 }}
              domain={volumeDomain}
            />
            <RechartsTooltip content={<PriceTooltip selectedCharts={selectedCharts} />} />
            <Legend
              verticalAlign={isMobile ? "bottom" : "top"}
              height={36}
              onClick={handleLegendClick}
              wrapperStyle={isMobile ? { position: 'relative', marginTop: '-48px' } : null}
            />
            <Bar
              yAxisId="left"
              dataKey="highPriceVolume"
              fill="lime"
              // stroke="lime"
              hide={hiddenSeries.includes('highPriceVolume')}
            />
            <Bar
              yAxisId="left"
              dataKey="lowPriceVolume"
              fill="red"
              // stroke="red"
              hide={hiddenSeries.includes('lowPriceVolume')}
            />
          </BarChart>)}

        {selectedCharts.includes("rsi") ? dataValidity.rsi ? `Relative Strength Index` : <>Increase data points to calculate RSI.<br></br></> : ""}
        {selectedCharts.includes("rsi") && dataValidity.rsi && (
          <LineChart
            data={formattedData}
            ref={chartRef}
            margin={getMargin()}
          >
            <defs>
              <linearGradient id="plumCrazy" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="DodgerBlue" stopOpacity={1} />
                <stop offset="100%" stopColor="BlueViolet" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              interval={calculateInterval(formattedData.length)}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              label={isMobile ? null : { value: "Time", position: 'insideBottom', dy: 20 }}
            />
            <YAxis
              yAxisId="rsi"
              domain={[0, 100]}
              ticks={[0, 30, 70, 100]}
              tickFormatter={(value) => `${value}`}
              label={isMobile ? null : { value: "RSI", angle: -90, position: 'insideLeft', dy: 30, dx: -32 }}
            />
            <RechartsTooltip content={<RSITooltip selectedCharts={selectedCharts} />} />
            <Legend
              verticalAlign={isMobile ? "bottom" : "top"}
              height={36}
              onClick={handleLegendClick}
              wrapperStyle={isMobile ? { position: 'relative', marginTop: '-48px' } : null}
            />
            <ReferenceLine y={70} yAxisId="rsi" stroke="rgba(30, 144, 255, 0.4)" strokeDasharray="3 3" />
            <ReferenceLine y={30} yAxisId="rsi" stroke="rgba(138, 43, 226, 0.4)" strokeDasharray="3 3" />
            <Line
              yAxisId="rsi"
              type="monotone"
              dataKey="rsi"
              stroke="url(#plumCrazy)"
              dot={false}
              hide={hiddenSeries.includes('rsi')}
            />
          </LineChart>
        )}

        {selectedCharts.includes("volatility") ? dataValidity.volatility ? `Volatility` : <>Increase data points to calculate volatility.<br></br></> : ""}
        {selectedCharts.includes("volatility") && dataValidity.volatility && (
          <LineChart
            data={formattedData}
            ref={chartRef}
            margin={getMargin()}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="red" stopOpacity={1} />
                <stop offset="100%" stopColor="yellow" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              interval={calculateInterval(formattedData.length)}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              label={isMobile ? null : { value: "Time", position: 'insideBottom', dy: 20 }}
            />
            <YAxis
              yAxisId="volatility"
              domain={[0, 'auto']}
              tickFormatter={(value) => `${(value * 100).toFixed(2)}%`}
              label={isMobile ? null : { value: "Volatility", angle: -90, position: 'insideLeft', dy: 30, dx: -32 }}
            />
            <RechartsTooltip content={<VolatilityTooltip selectedCharts={selectedCharts} />} />
            <Legend
              verticalAlign={isMobile ? "bottom" : "top"}
              height={36}
              onClick={handleLegendClick}
              wrapperStyle={isMobile ? { position: 'relative', marginTop: '-48px' } : null}
            />
            <Line
              yAxisId="volatility"
              type="monotone"
              dataKey="volatility"
              stroke="url(#colorUv)"
              dot={false}
              hide={hiddenSeries.includes('volatility')}
            />
          </LineChart>
        )}

        {selectedCharts.includes("sma") ? dataValidity.price ? `Simple Moving Average` : <>Increase data points to calculate SMA.<br /></> : ""}
        {selectedCharts.includes("sma") && dataValidity.price && (
          <LineChart
            data={formattedData}
            ref={chartRef}
            margin={getMargin()}
          >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8884d8" stopOpacity={1} />
                <stop offset="100%" stopColor="#82ca9d" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              interval={calculateInterval(formattedData.length)}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              label={isMobile ? null : { value: "Time", position: 'insideBottom', dy: 20 }}
            />
            <YAxis
              yAxisId="price"
              domain={['auto', 'auto']}
              tickFormatter={(value) => `${formatPrice(value)}`}
              label={isMobile ? null : { value: "Price", angle: -90, position: 'insideLeft', dy: 30, dx: -32 }}
            />
            <RechartsTooltip content={<SMATooltip selectedCharts={selectedCharts} />} />
            <Legend
              verticalAlign={isMobile ? "bottom" : "top"}
              height={36}
              onClick={handleLegendClick}
              wrapperStyle={isMobile ? { position: 'relative', marginTop: '-48px' } : null}
            />
            {/* <Line
      yAxisId="price"
      type="monotone"
      dataKey="price"
      stroke="url(#priceGradient)"
      dot={false}
      name="Price"
      hide={hiddenSeries.includes('price')}
    /> */}
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="sma14"
              stroke="orange"
              dot={false}
              name="SMA 14"
              hide={hiddenSeries.includes('sma14')}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="sma50"
              stroke="purple"
              dot={false}
              name="SMA 50"
              hide={hiddenSeries.includes('sma50')}
            />
          </LineChart>
        )}

        {selectedCharts.includes("ema") ? dataValidity.price ? `Exponential Moving Average` : <>Increase data points to calculate EMA.<br /></> : ""}
        {selectedCharts.includes("ema") && dataValidity.price && (
          <LineChart
            data={formattedData}
            ref={chartRef}
            margin={getMargin()}
          >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8884d8" stopOpacity={1} />
                <stop offset="100%" stopColor="#82ca9d" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              interval={calculateInterval(formattedData.length)}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              label={isMobile ? null : { value: "Time", position: 'insideBottom', dy: 20 }}
            />
            <YAxis
              yAxisId="price"
              domain={['auto', 'auto']}
              tickFormatter={(value) => `${formatPrice(value)}`}
              label={isMobile ? null : { value: "Price", angle: -90, position: 'insideLeft', dy: 30, dx: -32 }}
            />
            <RechartsTooltip content={<EMATooltip selectedCharts={selectedCharts} />} />
            <Legend
              verticalAlign={isMobile ? "bottom" : "top"}
              height={36}
              onClick={handleLegendClick}
              wrapperStyle={isMobile ? { position: 'relative', marginTop: '-48px' } : null}
            />
            {/* <Line
      yAxisId="price"
      type="monotone"
      dataKey="price"
      stroke="url(#priceGradient)"
      dot={false}
      name="Price"
      hide={hiddenSeries.includes('price')}
    /> */}
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="ema12"
              stroke="#ff7300"
              dot={false}
              name="EMA 12"
              hide={hiddenSeries.includes('ema12')}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="ema26"
              stroke="#00bfff"
              dot={false}
              name="EMA 26"
              hide={hiddenSeries.includes('ema26')}
            />
          </LineChart>
        )}

        {selectedCharts.includes("macd") ? dataValidity.price ? `Moving Average Conv/Divergence` : <>Increase data points to calculate MACD.<br /></> : ""}
        {selectedCharts.includes("macd") && dataValidity.price && (
          <ComposedChart
            data={formattedData}
            ref={chartRef}
            margin={getMargin()}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              interval={calculateInterval(formattedData.length)}
              tick={{ fontSize: isMobile ? 10 : 12, fill: "#ffffff" }}
              label={isMobile ? null : { value: "Time", position: 'insideBottom', dy: 20, fill: "#ffffff" }}
            />
            <YAxis
              yAxisId="macd"
              tickFormatter={(value) => value.toFixed(2)}
              tick={{ fill: "#ffffff" }}
              label={isMobile ? null : { value: "MACD", angle: -90, position: 'insideLeft', dy: 30, dx: -32, fill: "#ffffff" }}
            />
            <Tooltip content={<MACDTooltip selectedCharts={selectedCharts} />} />
            <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
            <Bar
              yAxisId="macd"
              dataKey="histogram"
              fill={(data) => (data.histogram >= 0 ? "#32CD32" : "#FF4500")}
              name="Histogram"
            />
            <Line
              yAxisId="macd"
              type="monotone"
              dataKey="macd"
              stroke="#00BFFF"
              dot={false}
              name="MACD"
            />
            <Line
              yAxisId="macd"
              type="monotone"
              dataKey="signal"
              stroke="#FF69B4"
              dot={false}
              name="Signal"
            />
          </ComposedChart>
        )}

        {!Object.values(dataValidity).some(Boolean) && (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography variant="body1">No valid data available for the selected charts.</Typography>
          </Box>
        )}

      </ResponsiveContainer>
    </ChartContainer>
  );
}