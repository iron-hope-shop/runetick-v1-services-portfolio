import { Box, Typography } from "@mui/material";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';

export const PriceTicker = ({ currentPrice, previousPrice }) => {
    const priceDiff = currentPrice - previousPrice;
    const percentChange = ((priceDiff / previousPrice) * 100).toFixed(2);
    const isPositive = priceDiff >= 0;
  
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          {currentPrice.toLocaleString()} gp
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', color: priceDiff === 0 ? 'white' : isPositive ? 'lime' : 'red' }}>
          {isPositive ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {Math.abs(priceDiff).toLocaleString()} ({percentChange}%)
          </Typography>
        </Box>
      </Box>
    );
  };