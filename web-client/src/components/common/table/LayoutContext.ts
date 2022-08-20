import { createContext, useContext } from "react";

export interface LayoutContext {
  totalHeight: number;
  totalWidth: number;
}

export const LayoutContext = createContext<LayoutContext | undefined>(
  undefined
);
export const useLayoutContext = () => {
  const c = useContext(LayoutContext);
  if (!c) {
    throw new Error(`useLayoutContext invoked outside of a Table`);
  }
  return c;
};
