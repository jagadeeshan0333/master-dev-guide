import React, { createContext, useState, useEffect } from 'react';
import { EntityConfig, User } from '@/api/entities';

export const EntityConfigContext = createContext(undefined);

export function EntityConfigProvider({ children }) {
  const [configs, setConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const loadConfigs = async () => {
      // Only load if component is mounted
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if user is admin before loading configs
        const user = await User.me().catch(() => null);
        
        if (!isMounted) return;
        
        if (!user || (user.app_role !== 'admin' && user.app_role !== 'super_admin')) {
          // Non-admin users don't need entity configs
          setConfigs([]);
          setIsLoading(false);
          return;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, 2000);
        });
        
        if (!isMounted) return;
        
        const fetchedConfigs = await EntityConfig.list().catch((err) => {
          // Only log if not an abort error
          if (err.message !== 'Request aborted') {
            console.warn('Failed to load entity configurations:', err);
          }
          return [];
        });
        
        if (isMounted) {
          setConfigs(Array.isArray(fetchedConfigs) ? fetchedConfigs : []);
        }
      } catch (err) {
        if (isMounted) {
          // Only set error if not an abort error
          if (err.message !== 'Request aborted') {
            console.error('Failed to load entity configurations:', err);
            setError(err);
          }
          setConfigs([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadConfigs();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const value = {
    configs,
    isLoading,
    error,
    refresh: () => {}, // No-op for now to prevent unnecessary reloads
  };

  return (
    <EntityConfigContext.Provider value={value}>
      {children}
    </EntityConfigContext.Provider>
  );
}