import { Box, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import { useState } from "react";

export const BuySellCalculator = ({ currentPrice, geLimit }) => {
    const [isBuying, setIsBuying] = useState(true);
    const [quantity, setQuantity] = useState(1);
  
    const handleToggleChange = () => {
      setIsBuying(!isBuying);
    };
  
    const handleQuantityChange = (event) => {
      setQuantity(Math.max(1, parseInt(event.target.value) || 1));
    };
  
    const totalCost = currentPrice * quantity;
    const totalWithTax = isBuying ? totalCost : totalCost * 0.99; // 1% tax on selling
    const timeToComplete = Math.ceil(quantity / geLimit) * 4; // Assuming GE updates every 4 hours
  
    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
        <FormControlLabel
          control={<Switch checked={isBuying} onChange={handleToggleChange} />}
          label={isBuying ? "Buying" : "Selling"}
          sx={{ color: 'white', mb: 1 }}
        />
        <TextField
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          label="Quantity"
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 1, input: { color: 'white' }, label: { color: 'white' } }}
        />
        <Typography variant="body2" sx={{ color: 'white', mb: 0.5 }}>
          Total {isBuying ? "Cost" : "Revenue"}: {totalWithTax.toLocaleString()} gp
        </Typography>
        <Typography variant="body2" sx={{ color: 'white' }}>
          Estimated Time: {timeToComplete} hours
        </Typography>
      </Box>
    );
  };