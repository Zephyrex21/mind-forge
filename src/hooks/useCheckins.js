/**
 * Hook for managing saved check-ins via the backend API.
 */
import { useState, useCallback } from 'react';
import { checkinsApi } from '../services/checkinsApi';

export function useCheckins() {
  const [checkins, setCheckins] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCheckins = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await checkinsApi.list();
      setCheckins(data);
      return data;
    } catch (_) {
      setCheckins([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await checkinsApi.stats();
      setStats(data);
      return data;
    } catch (_) {
      setStats(null);
    }
  }, []);

  const saveCheckin = useCallback(async (checkin) => {
    setIsLoading(true);
    try {
      const result = checkin.id ? await checkinsApi.update(checkin.id, checkin) : await checkinsApi.create(checkin);
      await loadCheckins();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [loadCheckins]);

  const deleteCheckin = useCallback(async (id) => {
    setIsLoading(true);
    try {
      await checkinsApi.remove(id);
      await loadCheckins();
    } finally {
      setIsLoading(false);
    }
  }, [loadCheckins]);

  const toggleFavorite = useCallback(async (id) => {
    await checkinsApi.toggleFavorite(id);
    await loadCheckins();
  }, [loadCheckins]);

  return {
    checkins,
    stats,
    isLoading,
    loadCheckins,
    loadStats,
    saveCheckin,
    deleteCheckin,
    toggleFavorite,
  };
}

export default useCheckins;
