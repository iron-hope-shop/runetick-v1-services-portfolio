// useUserSettings.js
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../AuthProvider/AuthProvider';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const fetchLastTenChanges = async ({ queryKey }) => {
  const [, getToken] = queryKey;
  
  const token = await getToken();
  if (!token) {
    throw new Error('Token is missing');
  }

  const response = await fetch(`${API_URL}/items/changes`, {
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

export const useLastTenChanges = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['lastTenChanges', getToken],
    queryFn: fetchLastTenChanges,
    refetchInterval: 5000,
    cacheTime: 5000,
    staleTime: 5000,
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
  });
};

// THIS HOOK WAS JUST A TEST FOR THE BOT, IT GIVES {"ID": [TIME CHANGES], etc} i.e.
// {
//   "2": [
//     {
//       "timestamp": 1721692993152,
//       "percentChange": 3.33,
//       "lastPrice": 248
//     },
//     {
//       "timestamp": 1721692998570,
//       "percentChange": 3.33,
//       "lastPrice": 248
//     },
//     {
//       "timestamp": 1721693003999,
//       "percentChange": 3.33,
//       "lastPrice": 248
//     },
//     {
//       "timestamp": 1721693009516,
//       "percentChange": 3.33,
//       "lastPrice": 248
//     },
//     {
//       "timestamp": 1721693014954,
//       "percentChange": 3.33,
//       "lastPrice": 248
//     }
//   ],
// ...
// }