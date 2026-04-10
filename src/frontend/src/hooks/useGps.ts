import { useCallback, useEffect, useState } from "react";

export interface GpsCoords {
  lat: number;
  lon: number;
  accuracy: number;
}

export type GpsPermission = "prompt" | "granted" | "denied" | "unavailable";

export function useGps() {
  const [coords, setCoords] = useState<GpsCoords | null>(null);
  const [permission, setPermission] = useState<GpsPermission>("prompt");
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermission("unavailable");
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPermission("unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPermission("granted");
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => {
        setPermission("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPermission("granted");
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => {
        setPermission("denied");
      },
      { enableHighAccuracy: true },
    );
    setWatchId(id);
    setIsTracking(true);
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  }, [watchId]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    coords,
    permission,
    isTracking,
    requestLocation,
    startTracking,
    stopTracking,
  };
}
