import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { Box, Typography } from '@mui/material';

export const NewsItem = ({ title, sentiment }) => {
    const getSentimentIcon = (sentiment) => {
      switch (sentiment) {
        case 'positive':
          return <SentimentVerySatisfiedIcon sx={{ color: 'lime' }} />;
        case 'negative':
          return <SentimentVeryDissatisfiedIcon sx={{ color: 'red' }} />;
        default:
          return <SentimentNeutralIcon sx={{ color: '#9e9e9e' }} />;
      }
    };
  
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {getSentimentIcon(sentiment)}
        <Typography variant="body2" sx={{ color: 'white', ml: 1 }}>
          {title}
        </Typography>
      </Box>
    );
  };