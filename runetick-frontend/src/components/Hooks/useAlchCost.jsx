// useAlchCost.js
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../AuthProvider/AuthProvider';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const fetchAlchCost = async ({ queryKey }) => {
  const [, getToken] = queryKey;
  
  const token = await getToken();
  if (!token) {
    throw new Error('Token is missing');
  }

  const response = await fetch(`${API_URL}/items/alch-cost`, {
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

export const useAlchCost = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['alchCost', getToken],
    queryFn: fetchAlchCost,
    refetchInterval: 30000,
    cacheTime: 60000,
    staleTime: 30000,
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
  });
};
