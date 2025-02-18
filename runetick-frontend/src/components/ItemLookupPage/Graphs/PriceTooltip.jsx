import React from "react";
import { styled } from '@mui/system';
import { Typography } from "@mui/material";

const GlassTooltip = styled('div')({
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    color: 'white'
});

const formatPrice = (price) => {
    return `${price.toLocaleString()} gp`;
};

const formatVolume = (volume) => {
    return `${volume.toLocaleString()} units`;
};

export const PriceTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const formattedDate = new Date(data.timestamp * 1000).toLocaleString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true // Add this option to include AM/PM
        });
        return (
            <GlassTooltip>
                <Typography variant="subtitle2" color="text.secondary">
                    {`Date: ${formattedDate}`}
                </Typography>
                <Typography variant="body2" color="text.primary">
                    HIGH: <strong>{formatPrice(data.avgHighPrice ?? 0)}</strong>
                </Typography>
                <Typography variant="body2" color="text.primary">
                    LOW: <strong>{formatPrice(data.avgLowPrice ?? 0)}</strong>
                </Typography>
                <Typography variant="body2" color="text.primary">
                    DIFF: <strong>{formatPrice((data?.avgHighPrice || 0) - (data?.avgLowPrice || 0))}</strong>
                </Typography>
            </GlassTooltip>
        );
    }

    return null;
};