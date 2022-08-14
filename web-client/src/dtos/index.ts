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
