import { webSocket } from "rxjs/webSocket";
import { Observable } from "rxjs";
import { requestStream } from "../utils";

export interface ITokenPair {
  baseToken: string;
  quoteToken: string;
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
export interface IOpenOrder {
  id: string;
  tokenPair: string;
  side: string;
  amount: number;
  failed: number;
  price: number;
  time: string;
}
export interface IOpenOrders {
  items: IOpenOrder[];
}

export class DummyService {
  private readonly _ws: any;
  constructor(url: string) {
    this._ws = webSocket(url);
  }
  public getTokenPairs = (): Observable<string[]> => {
    return requestStream(this._ws, "getTokenPairs", `getTokenPairs`, undefined);
  };
  public getPriceStream = (): Observable<ITokenPrice[]> => {
    return requestStream(
      this._ws,
      "getPriceStream",
      `getPriceStream`,
      undefined
    );
  };
  public getOrderBook = (
    tokenPair: string,
    priceLevelSize: number
  ): Observable<IOrderBook> => {
    return requestStream(
      this._ws,
      "getOrderBook",
      `getOrderBook_${tokenPair}_${priceLevelSize}`,
      [tokenPair, priceLevelSize]
    );
  };
  public getOpenOrders = (): Observable<IOpenOrders> => {
    return requestStream(this._ws, "getOpenOrders", `getOpenOrders`, undefined);
  };
}
