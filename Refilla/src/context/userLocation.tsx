import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";
import { Coords } from "../../types/location";

type LocationState = {
  coords: Coords | null;
  error: string | null;
  watching: boolean;
  start: () => Promise<void>;
  stop: () => void;
};

const LocationContext = createContext<LocationState>({
  coords: null,
  error: null,
  watching: false,
  start: async () => {},
  stop: () => {},
});

export const useLiveLocation = () => useContext(LocationContext);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const [sub, setSub] = useState<Location.LocationSubscription | null>(null);

  const stop = () => {
    sub?.remove();
    setSub(null);
    setWatching(false);
  };

  const start = async () => {
    setError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Location permission not granted");
      stop();
      return;
    }

    // avoid creating multiple watchers
    if (sub) return;

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 1000,      // ms
        distanceInterval: 1,     // meters
      },
      (loc) => {
        setCoords(loc.coords);
      }
    );

    setSub(subscription);
    setWatching(true);
  };

  useEffect(() => {
    // auto stop when provider unmounts
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ coords, error, watching, start, stop }),
    [coords, error, watching]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
