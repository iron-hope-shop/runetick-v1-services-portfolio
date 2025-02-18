import React, { useState, useEffect } from 'react';
import { Box, Checkbox, FormControlLabel, Grid, Tooltip, Typography } from "@mui/material";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";

export const TechnicalIndicators = ({ data, interval, numPoints }) => {
    const [visibleIndicators, setVisibleIndicators] = useState({
        rsi: false,
        movingAverage: false,
        volatility: false,
        macd: false,
        bollingerBands: false
    });

    const [processedData, setProcessedData] = useState([]);

    const toggleIndicator = (indicator) => {
        setVisibleIndicators(prev => ({ ...prev, [indicator]: !prev[indicator] }));
    };

    useEffect(() => {
        if (data && data.length > 0) {
            const slicedData = data.slice(-numPoints);
            const processed = slicedData.map(d => ({
                timestamp: d.timestamp,
                price: (d.avgHighPrice + d.avgLowPrice) / 2, // Using average of high and low as the price
                volume: d.highPriceVolume + d.lowPriceVolume
            }));
            setProcessedData(calculateIndicators(processed));
        }
    }, [data, numPoints]);

    const calculateIndicators = (data) => {
        return data.map((d, i, arr) => ({
            ...d,
            rsi: calculateRSI(arr, i),
            ma: calculateMA(arr, i),
            volatility: calculateVolatility(arr, i),
            macd: calculateMACD(arr, i),
            ...calculateBollingerBands(arr, i)
        }));
    };

    const calculateRSI = (data, index, period = 14) => {
        if (index < period) return null;
        let gains = 0, losses = 0;
        for (let i = index - period + 1; i <= index; i++) {
            const difference = data[i].price - data[i - 1].price;
            if (difference >= 0) gains += difference;
            else losses -= difference;
        }
        const averageGain = gains / period;
        const averageLoss = losses / period;
        const relativeStrength = averageGain / averageLoss;
        return 100 - (100 / (1 + relativeStrength));
    };

    const calculateMA = (data, index, period = 20) => {
        if (index < period - 1) return null;
        const sum = data.slice(index - period + 1, index + 1).reduce((acc, d) => acc + d.price, 0);
        return sum / period;
    };

    const calculateVolatility = (data, index, period = 20) => {
        if (index < period - 1) return null;
        const prices = data.slice(index - period + 1, index + 1).map(d => d.price);
        const mean = prices.reduce((a, b) => a + b) / period;
        const squaredDifferences = prices.map(p => Math.pow(p - mean, 2));
        return Math.sqrt(squaredDifferences.reduce((a, b) => a + b) / period);
    };

    const calculateMACD = (data, index, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) => {
        if (index < longPeriod - 1) return null;
        const shortEMA = calculateEMA(data, index, shortPeriod);
        const longEMA = calculateEMA(data, index, longPeriod);
        return shortEMA - longEMA;
    };

    const calculateEMA = (data, index, period) => {
        if (index < period - 1) return null;
        const k = 2 / (period + 1);
        let ema = data[index - period + 1].price;
        for (let i = index - period + 2; i <= index; i++) {
            ema = (data[i].price - ema) * k + ema;
        }
        return ema;
    };

    const calculateBollingerBands = (data, index, period = 20, multiplier = 2) => {
        if (index < period - 1) return { upperBB: null, lowerBB: null };
        const ma = calculateMA(data, index, period);
        const stdDev = calculateVolatility(data, index, period);
        return {
            upperBB: ma + multiplier * stdDev,
            lowerBB: ma - multiplier * stdDev
        };
    };

    const indicators = [
        { name: 'RSI', key: 'rsi', color: '#8884d8', type: 'line' },
        { name: 'Moving Average', key: 'ma', color: '#82ca9d', type: 'line' },
        { name: 'Volatility', key: 'volatility', color: '#ffc658', type: 'area' },
        { name: 'MACD', key: 'macd', color: '#ff7300', type: 'bar' },
        { name: 'Bollinger Bands', key: 'bollingerBands', upperColor: '#8884d8', lowerColor: '#82ca9d', type: 'line' }
    ];

    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem * 1000);
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    };

    const getDomain = (key) => {
        const values = processedData.map(d => d[key]).filter(v => v !== null);
        if (values.length === 0) return [0, 1];
        return [Math.min(...values), Math.max(...values)];
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>Technical Indicators</Typography>
            <Box sx={{ mb: 2 }}>
                {indicators.map(indicator => (
                    <FormControlLabel
                        key={indicator.key}
                        control={
                            <Checkbox
                                checked={visibleIndicators[indicator.key]}
                                onChange={() => toggleIndicator(indicator.key)}
                            />
                        }
                        label={indicator.name}
                        sx={{ color: 'white', mr: 2 }}
                    />
                ))}
            </Box>
            <Grid container spacing={2}>
                {indicators.map(indicator => (
                    visibleIndicators[indicator.key] && (
                        <Grid item xs={12} md={6} key={indicator.key}>
                            <ResponsiveContainer width="100%" height={200}>
                                {indicator.type === 'area' ? (
                                    <AreaChart data={processedData}>
                                        <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                                        <YAxis domain={getDomain(indicator.key)} />
                                        <RechartsTooltip />
                                        <Area type="monotone" dataKey={indicator.key} stroke={indicator.color} fill={indicator.color} />
                                    </AreaChart>
                                ) : indicator.key === 'bollingerBands' ? (
                                    <LineChart data={processedData}>
                                        <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                                        <YAxis domain={[Math.min(...processedData.map(d => d.lowerBB).filter(v => v !== null)), Math.max(...processedData.map(d => d.upperBB).filter(v => v !== null))]} />
                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey="upperBB" stroke={indicator.upperColor} />
                                        <Line type="monotone" dataKey="lowerBB" stroke={indicator.lowerColor} />
                                        <Line type="monotone" dataKey="price" stroke="#fff" />
                                    </LineChart>
                                ) : (
                                    <LineChart data={processedData}>
                                        <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                                        <YAxis domain={getDomain(indicator.key)} />
                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey={indicator.key} stroke={indicator.color} />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                            <Typography variant="body2" sx={{ color: 'white', textAlign: 'center' }}>{indicator.name}</Typography>
                        </Grid>
                    )
                ))}
            </Grid>
        </Box>
    );
};
