import { Chip } from "@mui/material";

const chipColors = {
    ID: '#0088FE',
    Members: '#00C49F',
    'high alch': '#FFBB28',
    'low alch': '#FF8042',
    'GE Limit': '#8884d8'
  };

export const CondensedDetailChip = ({ label, value }) => (
    <Chip
      label={`${label.toUpperCase()}: ${value}`}
      size="small"
      sx={{
        m: 0.5,
        backgroundColor: 'transparent',
        color: '#ffffff',
        border: `2px solid ${chipColors[label] || '#999999'}`,
        '& .MuiChip-label': {
          fontWeight: 'bold',
        },
      }}
    />
  );