// useUserLogMutations.js
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

const createLog = async ({ getToken, log }) => {
  const headers = await getAuthHeaders(getToken);
  const response = await fetch(`${API_URL}/users/logs`, {
    method: 'POST',
    headers,
    body: JSON.stringify(log),
  });

  if (!response.ok) {
    throw new Error('Failed to create log');
  }

  return response.json();
};

const updateLog = async ({ getToken, logId, log }) => {
  const headers = await getAuthHeaders(getToken);
  const response = await fetch(`${API_URL}/users/logs/${logId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(log),
  });

  if (!response.ok) {
    throw new Error('Failed to update log');
  }

  return response.json();
};

const deleteLog = async ({ getToken, logId }) => {
  const headers = await getAuthHeaders(getToken);
  const response = await fetch(`${API_URL}/users/logs/${logId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to delete log');
  }

  return response.json();
};

export const useUserLogMutations = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const createLogMutation = useMutation({
    mutationFn: (log) => createLog({ getToken, log }),
    onSuccess: () => {
      queryClient.invalidateQueries(['userLogs']);
    },
  });

  const updateLogMutation = useMutation({
    mutationFn: ({ logId, log }) => updateLog({ getToken, logId, log }),
    onSuccess: () => {
      queryClient.invalidateQueries(['userLogs']);
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: (logId) => deleteLog({ getToken, logId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['userLogs']);
    },
  });

  return {
    createLogMutation,
    updateLogMutation,
    deleteLogMutation,
  };
};