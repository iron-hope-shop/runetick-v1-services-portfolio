import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../AuthProvider/AuthProvider';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const fetchLatestNews = async ({ queryKey }) => {
  const [, getToken] = queryKey;
  
  const token = await getToken();
  if (!token) {
    throw new Error('Token is missing');
  }

  const response = await fetch(`${API_URL}/misc/osrs-news`, {
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

export const useNews = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['osrsNews', getToken],
    queryFn: fetchLatestNews,
    refetchInterval: 300000,
    cacheTime: 300000,
    staleTime: 300000,
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
  });
};
