import { useState, useCallback } from 'react';
import { firestore } from '../Firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useLoadingState } from './useLoadingState';
import { handleError } from '../utils/errorHandler';

export interface AvailabilitySlot {
  available: boolean;
  slots: string[];
}

export interface Availability {
  days: Record<string, AvailabilitySlot>;
}

export const useAvailability = (userId: string) => {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const { isLoading, error, withLoading } = useLoadingState();

  const fetchAvailability = useCallback(async () => {
    try {
      const docRef = doc(firestore, 'availability', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setAvailability(docSnap.data() as Availability);
      }
    } catch (error) {
      await handleError(error, 'fetchAvailability', {
        context: 'availability management',
        additionalInfo: `User: ${userId}`
      });
    }
  }, [userId]);

  const updateAvailability = useCallback(async (newAvailability: Availability) => {
    return withLoading(
      (async () => {
        const docRef = doc(firestore, 'availability', userId);
        const availabilityData = {
          days: Object.entries(newAvailability.days).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: {
              available: value.available,
              slots: value.slots
            }
          }), {})
        };
        await updateDoc(docRef, availabilityData);
        setAvailability(newAvailability);
      })()
    );
  }, [userId, withLoading]);

  return {
    availability,
    isLoading,
    error,
    fetchAvailability,
    updateAvailability
  };
};