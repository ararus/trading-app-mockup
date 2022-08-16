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

export interface IOrderBookMessage {
  type: "orderBook";
  tokenPair: string;
  priceLevelSize: number;
}

export interface IStreamRequest<T = any> {
  type: "subscribe";
  name: string;
  data?: T;
  key: string;
}

export interface IStreamUnsub {
  type: "unsubscribe";
  name: string;
  key: string;
}

export interface IStreamReply<T = any> {
  name: string;
  data?: T;
  key: string;
}
