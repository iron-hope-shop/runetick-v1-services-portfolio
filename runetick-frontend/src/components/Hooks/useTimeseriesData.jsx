import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { auth } from '../../firebase'; // Adjust the path based on your firebase config file location

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const fetchTimeseriesData = async ({ queryKey }) => {
  const [_, itemId, interval] = queryKey;

  // Get the Firebase token
  const token = await auth.currentUser.getIdToken();

  const response = await axios.get(`${API_URL}/items/price`, {
    params: { id: itemId, interval },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
};

// Define a function to get the refetchInterval and staleTime based on the interval parameter
const getTimingConfig = (interval) => {
  switch (interval) {
    case '5m':
      return { refetchInterval: 300000, staleTime: 300000 }; // 5 minutes
    case '1h':
      return { refetchInterval: 3600000, staleTime: 3600000 }; // 1 hour
    case '6h':
      return { refetchInterval: 21600000, staleTime: 21600000 }; // 6 hours
    case '24h':
      return { refetchInterval: 86400000, staleTime: 86400000 }; // 24 hours
    default:
      return { refetchInterval: 300000, staleTime: 300000 }; // Default to 5 minutes
  }
};

export const useTimeseriesData = (itemId, interval, delay = 0) => {
  const [isDelayed, setIsDelayed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayed(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Use the function to get the appropriate timing configuration
  const { refetchInterval, staleTime } = getTimingConfig(interval);

  return useQuery({
    queryKey: ['timeseriesData', itemId, interval],
    queryFn: fetchTimeseriesData,
    refetchInterval: isDelayed ? refetchInterval : false, // Set dynamically based on interval
    staleTime: isDelayed ? staleTime : 0, // Set dynamically based on interval
    cacheTime: 300000, // Fixed to 5 minutes
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
    enabled: isDelayed, // Only enable the query after the delay
  });
};