import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useLocationStore } from '../lib/locationStore';

export type LocationStatus =
  | 'idle'
  | 'loading'
  | 'granted'
  | 'denied'
  | 'error';

type UseLocation = {
  status: LocationStatus;
  errorMsg: string | null;
  coords: { lat: number; lng: number } | null;
  /** Request OS permission and read the current GPS position. */
  requestLocation: () => Promise<void>;
  /** Fallback when permission is denied: geocode a city/place name. */
  setManualLocation: (query: string) => Promise<boolean>;
};

export function useLocation(): UseLocation {
  const coords = useLocationStore((s) => s.coords);
  const setCoords = useLocationStore((s) => s.setCoords);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const didAutoRequest = useRef(false);

  const requestLocation = useCallback(async () => {
    setStatus('loading');
    setErrorMsg(null);
    try {
      const { status: permission } =
        await Location.requestForegroundPermissionsAsync();
      if (permission !== 'granted') {
        setStatus('denied');
        setErrorMsg('Location permission denied — enter a city instead.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setStatus('granted');
    } catch (e) {
      setStatus('error');
      setErrorMsg(
        e instanceof Error ? e.message : 'Could not get your location.',
      );
    }
  }, [setCoords]);

  const setManualLocation = useCallback(
    async (query: string): Promise<boolean> => {
      const trimmed = query.trim();
      if (!trimmed) return false;
      setStatus('loading');
      setErrorMsg(null);
      try {
        const results = await Location.geocodeAsync(trimmed);
        const first = results[0];
        if (!first) {
          setStatus('error');
          setErrorMsg(`Couldn't find "${trimmed}".`);
          return false;
        }
        setCoords({ lat: first.latitude, lng: first.longitude });
        setStatus('granted');
        return true;
      } catch (e) {
        setStatus('error');
        setErrorMsg(
          e instanceof Error ? e.message : 'Location lookup failed.',
        );
        return false;
      }
    },
    [setCoords],
  );

  // Kick off the permission flow once on mount; callers can re-trigger via
  // requestLocation (e.g. a "retry" button).
  useEffect(() => {
    if (didAutoRequest.current) return;
    didAutoRequest.current = true;
    void requestLocation();
  }, [requestLocation]);

  return { status, errorMsg, coords, requestLocation, setManualLocation };
}
