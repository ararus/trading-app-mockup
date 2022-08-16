import { filter, map, Observable, Subject, Subscribable } from "rxjs";
import { IOrderBook, IOrderBookMessage, ITokenPrice } from "../dtos";
import { webSocket } from "rxjs/webSocket";
import { IStreamReply } from "../../../server/src/dtos";

export class ServerApi {
  private _ws: any;

  constructor() {
    this._ws = webSocket("ws://localhost:3000/api/ws");
  }

  private requestStream<T = any>(name: string, key: string = name, data?: T) {
    return this._ws
      .multiplex(
        () => ({ type: "subscribe", name, key, data }),
        () => ({ type: "unsubscribe", key }),
        (message: IStreamReply<T>) => message.key === key
      )
      .pipe(map((message: IStreamReply<T>) => message.data));
  }

  public getTokenPairs = (): Observable<string[]> =>
    this.requestStream("tokenPairs");

  public getPriceStream = (): Observable<ITokenPrice[]> =>
    this.requestStream("tokenPrices");

  public getOrderBook = (
    tokenPair: string,
    priceLevelSize: number
  ): Observable<IOrderBook> =>
    this.requestStream(
      "orderBook",
      `orderBook_${tokenPair}_${priceLevelSize}`,
      [tokenPair, priceLevelSize]
    );
}
