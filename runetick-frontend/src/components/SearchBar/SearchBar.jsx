import React, { useState, useCallback, useEffect } from 'react';
import { Autocomplete, TextField, Box, Typography, InputAdornment, CircularProgress,  } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useItemMapping } from '../Hooks/useItemMapping';
import { useMultipleItems } from '../Hooks/useMultipleItems';
import { ItemIcon } from '../ItemIcon/ItemIcon';
import { useDebounce } from '../Hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const { data: itemMapping, isLoading, error } = useItemMapping();
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const navigate = useNavigate();

  const navigateToItem = (itemId) => {
    const queryParams = new URLSearchParams({ id: itemId })
    navigate(`/item?${queryParams}`);
  };

  const debouncedInputValue = useDebounce(inputValue, 300);

  const { data: itemsData, isLoading: useMultipleItemsSelected } = useMultipleItems(selectedItemIds, open);

  const retrieveAndRankOptions = useCallback((options, input) => {
    if (!options || !Array.isArray(options)) {
      return [];
    }

    const searchValue = typeof input === 'string' ? input.toLowerCase() : '';
    const searchTerms = searchValue.split(/\s+/);

    const retrieved = options.filter(option => {
      const nameLower = option.name.toLowerCase();
      const idString = option.id.toString();
      return searchTerms.every(term =>
        nameLower.includes(term) || idString.includes(term)
      );
    });

    const ranked = retrieved.map(option => {
      let score = 0;
      const nameLower = option.name.toLowerCase();
      const nameWords = nameLower.split(/\s+/);
      const idString = option.id.toString();

      // Exact match
      if (nameLower === searchValue || idString === searchValue) {
        score += 1000;
      }

      // Start of word matches
      searchTerms.forEach(term => {
        if (nameWords.some(word => word.startsWith(term))) {
          score += 100;
        }
      });

      // Substring matches
      searchTerms.forEach(term => {
        if (nameLower.includes(term)) {
          score += 50;
        }
      });

      // Fuzzy matching using Levenshtein distance
      const minDistance = Math.min(...nameWords.map(word => levenshteinDistance(searchValue, word)));
      score -= minDistance * 2;  // Penalize distance, but less severely

      // Prioritize shorter names when scores are close
      score -= option.name.length;

      return { ...option, score };
    });

    ranked.sort((a, b) => b.score - a.score);

    return ranked.slice(0, 8);
  }, []);

  useEffect(() => {
    if (itemMapping && debouncedInputValue !== undefined) {
      const rankedOptions = retrieveAndRankOptions(itemMapping, debouncedInputValue);
      setFilteredOptions(rankedOptions);
      setSelectedItemIds(rankedOptions.map(option => option.id));
    } else {
      setFilteredOptions([]);
      setSelectedItemIds([]);
    }
  }, [itemMapping, debouncedInputValue, retrieveAndRankOptions]);

  const levenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };

  const getPercentChangeColor = (item) => {

    const { lastPrice, highPrice, lowPrice } = item;
    const prevPrice = item.isDown ? highPrice : lowPrice;
    const diff = lastPrice - prevPrice;
    const isPositive = diff >= 0;

    if (isPositive) return 'lime';
    if (!isPositive) return 'red';
    return 'white';
  };

  const getPercentageText = (item) => {
    const { lastPrice, highPrice, lowPrice } = item;
    const prevPrice = item.isDown ? highPrice : lowPrice;
    const diff = lastPrice - prevPrice;
    const percentChange = ((diff) / prevPrice * 100).toFixed(2);
    return percentChange
  }

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={filteredOptions}
      getOptionLabel={(option) => `${option.name}`}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search OSRS items by name or ID..."
          variant="outlined"
          onChange={(e) => setInputValue(e.target.value)}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),

          }} 
          sx={{
            width: { xs: 200, sm: 300, md: 420 },
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(18, 18, 18, 0.4)',
              backdropFilter: 'blur(10px)',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '2px 4px',
              transition: 'box-shadow 0.3s ease-in-out',
              '& fieldset': {
                borderColor: 'transparent',
              },
            },

          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <li key={key} {...otherProps}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {option ? (
                <ItemIcon
                  src={`https://oldschool.runescape.wiki/images/${option.icon.replace(/ /g, '_')}`}
                  alt="item"
                  size={32}
                />
              ) : ""}
            <Box sx={{ flexGrow: 1, ml: 1 }}>
              <Typography variant="subtitle1" sx={{ color: 'white' }}>
                {option.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                (ID: {option.id})
                Limit: {option?.limit || '??'}
              </Typography>
            </Box>
            {itemsData && itemsData[option.id] && (itemsData[option.id].percentChange)}
            {itemsData && itemsData[option.id] && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                color: getPercentChangeColor(itemsData[option.id])
              }}>
                {/* {priceDiff !== 0 && (isPositive ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />)} */}
                {getPercentageText(itemsData[option.id]) > 0 ? '+' : ''}
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {
                    `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(getPercentageText(itemsData[option.id]))}%`
                  }
                </Typography>
              </Box>
            )}
          </Box>
        </li>
      )}}
      onChange={(event, newValue) => {
        if (newValue) {
          navigateToItem(newValue.id);
        }
      }}
      filterOptions={(x) => x}
      PaperComponent={({ children }) => (
        <Box
          sx={{
            backgroundColor: 'rgba(18, 18, 18, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '4px',
            mt: '4px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {children}
        </Box>
      )}
      ListboxProps={{
        sx: { maxHeight: '400px' }
      }}
    />
  );
};

export default SearchBar;