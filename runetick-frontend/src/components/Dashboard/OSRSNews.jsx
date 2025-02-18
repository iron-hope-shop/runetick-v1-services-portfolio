import React from 'react';
import { Box, Typography, List, ListItem, Link } from '@mui/material';
import { mockOSRSNews } from './mockData';
import { useNews } from '../Hooks/useNews';

const OSRSNews = () => {
  const { data: newsData } = useNews();
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center' }}>
        OSRS News <Typography variant="caption" sx={{ color: 'grey', marginLeft: 1 }}>(times in your local time)</Typography>
      </Typography>
      <List>
        {newsData ? newsData.items.map((news, index) => (
          <ListItem key={index} sx={{ mb: 2, p: 0 }}>
            <Link
              href={news.guid}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{
                display: 'flex',
                width: '100%',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transition: 'background-color 0.3s'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 2 }}>
                <img
                  src={news.enclosure.url}
                  alt={news.title}
                  style={{ width: 100, height: 100, marginRight: 16, objectFit: 'cover' }}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ color: 'white' }}>{news.title}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Published on {new Date(news.pubDate).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {news.contentSnippet}
                  </Typography>
                </Box>
              </Box>
            </Link>
          </ListItem>
        )) : "Walking to the bank..."}
      </List>
    </Box>
  );
};

export default OSRSNews;