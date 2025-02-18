import React, { useState, useEffect } from 'react';
import { Select, MenuItem } from '@mui/material';

const TIMEZONE_LIST = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Dubai',
  'Australia/Sydney',
  // Add more timezones as needed
];

const CustomTimezoneSelector = ({ value, onChange }) => {
  const [timezones, setTimezones] = useState([]);

  useEffect(() => {
    const formattedTimezones = TIMEZONE_LIST.map(tz => {
      const now = new Date();
      const tzTime = now.toLocaleString('en-US', { timeZone: tz });
      const offset = now.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'short' }).split(' ').pop();
      return { value: tz, label: `${tz.replace('_', ' ')} (${offset}) - ${tzTime}` };
    });
    setTimezones(formattedTimezones);
  }, []);

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      sx={{
        color: 'white',
        '& .MuiSelect-icon': { color: 'white' },
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        '& fieldset': {
          borderColor: 'rgba(255, 255, 255, 0.23)',
        },
        '&:hover fieldset': {
          borderColor: 'rgba(255, 255, 255, 0.4)',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#fff',
        },
      }}
    >
      {timezones.map((tz) => (
        <MenuItem key={tz.value} value={tz.value}>
          {tz.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export default CustomTimezoneSelector;