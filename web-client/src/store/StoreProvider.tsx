import { createContext, FC, ReactNode, useContext } from "react";
import { RootStore } from "./RootStore";

const StoreContext = createContext<RootStore | undefined>(undefined);
const rootStore = new RootStore();

export const StoreProvider: FC<{ children: ReactNode }> = (props) => {
  return (
    <StoreContext.Provider value={rootStore}>
      {props.children}
    </StoreContext.Provider>
  );
};

export const useStore = (): RootStore => {
  const s = useContext(StoreContext);
  if (!s) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return s;
};
