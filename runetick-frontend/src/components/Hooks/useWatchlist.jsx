import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../AuthProvider/AuthProvider';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const fetchWatchlist = async ({ queryKey }) => {
  const [, getToken] = queryKey;
  const token = await getToken();
  if (!token) {
    throw new Error('Token is missing');
  }

  const response = await fetch(`${API_URL}/users/watchlist`, {
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

export const useWatchlist = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['watchlist', getToken],
    queryFn: fetchWatchlist,
    staleTime: 60000, // Data is considered stale after 1 minute
    cacheTime: 300000, // Data is cached for 5 minutes
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
  });
};
