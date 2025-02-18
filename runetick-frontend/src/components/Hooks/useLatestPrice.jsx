import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../AuthProvider/AuthProvider';
import { useCallback, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const fetchLatestPrice = async ({ queryKey }) => {
  const [, itemId, getToken] = queryKey;
  
  const token = await getToken();
  if (!token) {
    throw new Error('Token is missing');
  }

  const response = await fetch(`${API_URL}/items/latest-price?id=${itemId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please check your token');
    }
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export const useLatestPrice = (itemId) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const previousDataRef = useRef();

  const queryKey = ['latestPrice', itemId, getToken];

  const refetchIfChanged = useCallback((data) => {
    if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      previousDataRef.current = data;
      return true;
    }
    return false;
  }, []);

  return useQuery({
    queryKey,
    queryFn: fetchLatestPrice,
    refetchInterval: 5000,
    staleTime: Infinity, // Data is never considered stale automatically
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
    enabled: !!itemId, // Only run the query if itemId is provided
    onSuccess: (data) => {
      if (refetchIfChanged(data)) {
        queryClient.invalidateQueries(queryKey);
      }
    },
  });
};