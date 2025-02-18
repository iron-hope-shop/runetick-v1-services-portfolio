import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Collapse, CircularProgress } from '@mui/material';
import IndexCard from './IndexCard';

const MarketIndices = ({ isExpanded, onToggle, indicesData, isLoading, error, onItemSelect }) => {
    const [processedIndices, setProcessedIndices] = useState({});

    useEffect(() => {
        if (indicesData) {
            const newProcessedIndices = {};
            Object.entries(indicesData).forEach(([key, value]) => {
                const previousData = processedIndices[key];
                const currentPrice = value.averagePrice;
                const previousPrice = previousData ? previousData.currentPrice : currentPrice;
                const priceDiff = currentPrice - previousPrice;
                const percentChange = value.averagePercentChange;

                newProcessedIndices[key] = {
                    ...value,
                    currentPrice,
                    previousPrice,
                    priceDiff,
                    percentChange,
                };
            });
            setProcessedIndices(newProcessedIndices);
        }
    }, [indicesData]);

    return (
        <Box sx={{ flexGrow: 1, overflow: 'auto', marginTop: -2 }}>
            <Box sx={{ pt: isExpanded ? 2 : 0 }}>
                <Collapse in={isExpanded}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Typography color="error" sx={{ p: 2 }}>Error loading indices: {error.message}</Typography>
                    ) : (
                        <Grid container spacing={2}>
                            {Object.entries(processedIndices).map(([key, value]) => (
                                <Grid item xs={6} sm={4} md={3} lg={2} key={key}>
                                    <IndexCard name={key} data={value} onItemSelect={onItemSelect} />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Collapse>
            </Box>
        </Box>
    );
};

export default MarketIndices;