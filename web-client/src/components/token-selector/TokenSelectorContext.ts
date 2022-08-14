import { createContext, useContext } from "react";
import { TokenPair } from "../../store";

export interface ITokenSelectorContext {
  toggleFavorite: (tokenPair: TokenPair) => void;
}

export const TokenSelectorContext = createContext<
  ITokenSelectorContext | undefined
>(undefined);

export function useTokenSelectorContext() {
  const c = useContext(TokenSelectorContext);
  if (!c) {
    throw new Error(
      `useTokenSelectorContext should be used within a TokenSelector`
    );
  }
  return c;
}
