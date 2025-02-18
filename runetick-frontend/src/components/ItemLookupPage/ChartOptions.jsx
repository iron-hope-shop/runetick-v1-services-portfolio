import React, { useEffect, useState } from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { XAxis, YAxis } from 'recharts';

// Update XAxis and YAxis to use default parameters instead of defaultProps
const CustomXAxis = ({ tick = {}, ...props }) => <XAxis tick={tick} {...props} />;
const CustomYAxis = ({ tick = {}, ...props }) => <YAxis tick={tick} {...props} />;

const ChartOptions = ({ interval, setInterval, numPoints, setNumPoints }) => {
  const [numPointsOptions, setNumPointsOptions] = useState([]);
  const [numPointsLabels, setNumPointsLabels] = useState([]);

  const selectStyle = {
    color: 'white',
    '& .MuiSelect-icon': { color: 'white' },
    background: 'rgba(18, 18, 18, 0.8)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    minWidth: 80,
    '&:hover': {
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
  };

  const menuProps = {
    PaperProps: {
      sx: {
        background: 'rgba(18, 18, 18, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        color: '#ffffff',
      },
    },
  };

  const menuItemStyle = {
    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  };

  const numPointsMapping = {
    '5m': { points: [12, 36, 72, 144, 288, 365], labels: ['1 hour', '3 hours', '6 hours', '12 hours', '24 hours', '30 hours'] },
    '1h': { points: [12, 24, 168, 365], labels: ['12 hours', '1 day', '1 week', '2 weeks'] },
    '6h': { points: [28, 56, 84, 112, 168, 365], labels: ['7 days', '14 days', '21 days', '28 days', '1 week', '3 months'] },
    '24h': { points: [7, 14, 21, 28, 90, 180, 365], labels: ['1 week', '2 weeks', '3 weeks', '4 weeks', '3 months', '6 months', '1 year'] },
  };

  useEffect(() => {
    if (numPointsMapping[interval]) {
      setNumPointsOptions(numPointsMapping[interval].points);
      setNumPointsLabels(numPointsMapping[interval].labels);
      if (!numPointsMapping[interval].points.includes(numPoints)) {
        setNumPoints(numPointsMapping[interval].points[0]);
      }
    } else {
      console.warn(`No mapping found for interval: ${interval}`);
    }
  }, [interval, numPoints, setNumPoints]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: 2,
        justifyContent: 'flex-start',
      }}
    >
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="interval-select-label">Interval</InputLabel>
        <Select
          labelId="interval-select-label"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          label="Interval" // This should match the content of InputLabel for accessibility
          sx={selectStyle}
          MenuProps={menuProps}
        >
          <MenuItem value="5m" sx={menuItemStyle}>5min</MenuItem>
          <MenuItem value="1h" sx={menuItemStyle}>1hr</MenuItem>
          <MenuItem value="6h" sx={menuItemStyle}>6hrs</MenuItem>
          <MenuItem value="24h" sx={menuItemStyle}>24hrs</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="num-points-select-label">Data Points</InputLabel>
        <Select
          labelId="num-points-select-label"
          value={numPoints}
          onChange={(e) => setNumPoints(Number(e.target.value))}
          label="Number of Points" // This should match the content of InputLabel for accessibility
          sx={selectStyle}
          MenuProps={menuProps}
        >
          {numPointsOptions.map((points, index) => (
            <MenuItem key={points} value={points} sx={menuItemStyle}>
              {numPointsLabels[index]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export { ChartOptions, CustomXAxis, CustomYAxis };