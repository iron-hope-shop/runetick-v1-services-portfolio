import { Box, Pagination } from "@mui/material";
import { useState } from "react";
import { NewsItem } from "./NewsItem";

export const NewsList = ({ news }) => {
    const [page, setPage] = useState(1);
    const itemsPerPage = 3;
  
    const handleChange = (event, value) => {
      setPage(value);
    };
  
    const displayedNews = news.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  
    return (
      <Box sx={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          {displayedNews.map((item, index) => (
            <NewsItem key={index} title={item.title} sentiment={item.sentiment} />
          ))}
        </Box>
        <Pagination
          count={Math.ceil(news.length / itemsPerPage)}
          page={page}
          onChange={handleChange}
          sx={{
            mt: 2,
            '& .MuiPaginationItem-root': {
              color: 'white',
            },
          }}
        />
      </Box>
    );
  };