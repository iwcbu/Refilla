import { createContext, useContext } from "react";

type unitCtx = {
  metric: boolean;
  setMetric: (v: boolean) => void;
};

const UnitContext = createContext<unitCtx>({
  metric: false,
  setMetric: () => {},
});

export const useMetric = () => useContext(UnitContext);
export default UnitContext;
