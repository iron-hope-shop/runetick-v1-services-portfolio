import { Chip } from "@mui/material";

export const BuySellIndicator = ({ recommendation }) => {
    const isRecommendedToBuy = recommendation === 'BUY';
    return (
      <Chip
        // icon={isRecommendedToBuy ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        label={recommendation}
        color={isRecommendedToBuy ? 'success' : 'error'}
        size="small"
        sx={{
          // width: 48,
          mt: 1,
          width: 64,
          bgcolor: 'transparent',
          color: isRecommendedToBuy ? 'lime' : 'red',
          border: `1px solid ${isRecommendedToBuy ? 'lime' : 'red'}`,
        }}
      />
    );
  };