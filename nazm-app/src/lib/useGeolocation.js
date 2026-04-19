import { useState, useCallback } from 'react';

// Native geolocation capture for field verification.
// Returns { position, error, loading, capture() }.
// position shape: { latitude, longitude, accuracy, timestamp, altitude, heading, speed }.

const defaultOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

export function useGeolocation(options = defaultOptions) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const capture = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError({ code: 'UNSUPPORTED', message: 'Geolocation unavailable in this environment' });
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
          accuracy: p.coords.accuracy,
          altitude: p.coords.altitude,
          heading: p.coords.heading,
          speed: p.coords.speed,
          timestamp: p.timestamp,
        });
        setLoading(false);
      },
      (err) => {
        setError({ code: err.code, message: err.message });
        setLoading(false);
      },
      options,
    );
  }, [options]);

  return { position, error, loading, capture };
}
