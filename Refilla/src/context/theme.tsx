import { createContext, useContext } from "react";

type ThemeCtx = {
  dark: boolean;
  setDark: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeCtx>({
  dark: false,
  setDark: () => {},
});

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
