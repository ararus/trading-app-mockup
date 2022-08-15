export interface ITokenPair {
  baseToken: string;
  quoteToken: string;
}

export interface ITokenPairInfo {
  tokenPair: ITokenPair;
  isFavorite: boolean;
  lastPrice: number;
  lastPriceUsd: number;
  change24h: number;
}

export interface ITokenPrice {
  token: string;
  priceUsd: number;
}

export interface IPriceLevel {
  price: number;
  amount: number;
  total: number;
}

export interface IOrderBook {
  buyLevels: IPriceLevel[];
  sellLevels: IPriceLevel[];
  lastPrice: number;
  lastPriceUsd: number;
  change: number;
}
