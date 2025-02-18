import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../AuthProvider/AuthProvider';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const getAuthHeaders = async (getToken) => {
  const token = await getToken();
  if (!token) {
    throw new Error('Token is missing');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const addItemToWatchlist = async ({ getToken, itemId }) => {
  const headers = await getAuthHeaders(getToken);
  const response = await fetch(`${API_URL}/users/watchlist`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ itemId }),
  });
  if (!response.ok) {
    throw new Error('Failed to add item to watchlist');
  }
  return response.json();
};

const removeItemFromWatchlist = async ({ getToken, itemId }) => {
  const headers = await getAuthHeaders(getToken);
  const response = await fetch(`${API_URL}/users/watchlist/${itemId}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    throw new Error('Failed to remove item from watchlist');
  }
  return response.json();
};

export const useWatchlistMutations = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const addItemMutation = useMutation({
    mutationFn: ({ itemId }) => addItemToWatchlist({ getToken, itemId }),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries(['watchlist']);
      const previousWatchlist = queryClient.getQueryData(['watchlist']);
      queryClient.setQueryData(['watchlist'], (old) => [...(old || []), newItem]);
      return { previousWatchlist };
    },
    onError: (err, newItem, context) => {
      queryClient.setQueryData(['watchlist'], context.previousWatchlist);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['watchlist']);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ itemId }) => removeItemFromWatchlist({ getToken, itemId }),
    onMutate: async (removedItem) => {
      await queryClient.cancelQueries(['watchlist']);
      const previousWatchlist = queryClient.getQueryData(['watchlist']);
      queryClient.setQueryData(['watchlist'], (old) => 
        old ? old.filter(item => item.id !== removedItem.itemId) : []
      );
      return { previousWatchlist };
    },
    onError: (err, removedItem, context) => {
      queryClient.setQueryData(['watchlist'], context.previousWatchlist);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['watchlist']);
    },
  });

  return { addItemMutation, removeItemMutation };
};