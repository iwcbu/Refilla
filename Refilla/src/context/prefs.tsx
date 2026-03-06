// src/context/prefs.tsx

import { createContext, useContext } from "react";

export type Prefs = {
  dark: boolean;
  metric: boolean;
  pushNotifications: boolean;
};

type PrefsCtx = {
  prefs: Prefs;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
};

export const DEFAULT_PREFS: Prefs = {
  dark: false,
  metric: false,
  pushNotifications: false,
};

const PrefsContext = createContext<PrefsCtx>({
  prefs: DEFAULT_PREFS,
  setPref: () => {},
});

export const usePrefs = () => useContext(PrefsContext);
export default PrefsContext;
