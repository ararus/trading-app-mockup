import { filter, map, Observable, Subject, Subscribable } from "rxjs";
import { IOrderBook, IOrderBookMessage, ITokenPrice } from "../dtos";
import { webSocket } from "rxjs/webSocket";

export class ServerApi {
  private _ws: any;

  constructor() {
    this._ws = webSocket("ws://localhost:3000/api/ws");
  }

  public getTokenPairs(): Observable<string[]> {
    return this._ws
      .multiplex(
        () => ({ subscribe: "tokenPairs" }),
        () => ({ unsubscribe: "tokenPairs" }),
        (message: { type: string }) => message.type === "tokenPairs"
      )
      .pipe(map((message: any) => message.data));
  }

  public getPriceStream(): Observable<ITokenPrice[]> {
    return this._ws
      .multiplex(
        () => ({ subscribe: "tokenPrices" }),
        () => ({ unsubscribe: "tokenPrices" }),
        (message: { type: string }) => message.type === "tokenPrices"
      )
      .pipe(map((message: any) => message.data));
  }

  public getOrderBook(
    tokenPair: string,
    priceLevelSize: number
  ): Observable<IOrderBook> {
    return this._ws
      .multiplex(
        () => ({ subscribe: "orderBook", tokenPair, priceLevelSize }),
        () => ({ unsubscribe: "orderBook", tokenPair, priceLevelSize }),
        (message: IOrderBookMessage) =>
          message.type === "orderBook" &&
          message.tokenPair === tokenPair &&
          message.priceLevelSize === priceLevelSize
      )
      .pipe(map((message: any) => message.data));
  }
}
