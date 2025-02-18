import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../AuthProvider/AuthProvider';
import { useCallback, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const fetchLiveStatus = async ({ queryKey }) => {
  const [, getToken] = queryKey;
  
  const token = await getToken();
  if (!token) {
    throw new Error('Token is missing');
  }

  const response = await fetch(`${API_URL}/live`, {
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

export const useLiveStatus = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const previousDataRef = useRef();

  const queryKey = ['liveStatus', getToken];

  const refetchIfChanged = useCallback((data) => {
    if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      previousDataRef.current = data;
      return true;
    }
    return false;
  }, []);

  const queryInfo = useQuery({
    queryKey,
    queryFn: fetchLiveStatus,
    refetchInterval: 60000, // Keep checking every minute
    staleTime: Infinity, // Data is never considered stale automatically
    notifyOnChangeProps: ['data', 'status'],
    onSuccess: (data) => {
      if (refetchIfChanged(data)) {
        queryClient.invalidateQueries(queryKey);
      }
    },
  });

  return {
    ...queryInfo,
    isLive: queryInfo.status === 'success' && queryInfo.data ? true : false,
  };
};