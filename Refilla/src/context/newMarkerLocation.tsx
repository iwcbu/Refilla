import React, { createContext, useContext, useMemo, useState } from "react";

export type MarkerLoc = { latitude: number | null; longitude: number | null } | null;

type NewMarkerLocCtx = {
  markerLoc: MarkerLoc;
  setNewMarkerLoc: (loc: MarkerLoc) => void;
};

const NewMarkerLocContext = createContext<NewMarkerLocCtx>({
  markerLoc: null,
  setNewMarkerLoc: () => {},
});

export const useNewMarkerLoc = () => useContext(NewMarkerLocContext);

export function NewMarkerLocProvider({ children }: { children: React.ReactNode }) {
  const [markerLoc, setNewMarkerLoc] = useState<MarkerLoc>(null);

  const value = useMemo(() => ({ markerLoc, setNewMarkerLoc }), [markerLoc]);

  return (
    <NewMarkerLocContext.Provider value={value}>
      {children}
    </NewMarkerLocContext.Provider>
  );
}

export default NewMarkerLocContext;
