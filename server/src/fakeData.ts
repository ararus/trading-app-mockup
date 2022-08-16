import { ITokenPair, ITokenPrice, IPriceLevel, IOrderBook } from "./dtos";
import { mainTokens, tokens } from "./data/tokens";
import { from, interval, map, Observable, share, tap, timer } from "rxjs";

function makePairs() {
  const pairs: ITokenPair[] = [];
  for (let quoteToken of mainTokens) {
    for (let baseToken of tokens) {
      if (quoteToken !== baseToken) {
        pairs.push({ baseToken, quoteToken });
      }
    }
  }
  return pairs;
}

const MAX_PRICE_USD = 100000;

function makePrices(tokens: string[]) {
  const prices: ITokenPrice[] = tokens.map((token) => ({
    token,
    priceUsd: Math.random() * MAX_PRICE_USD,
  }));
  return prices;
}

function randomShift(max: number) {
  return Math.random() * max * 2 - max;
}

// export class DataSource {
//   public tokens: string[] = [];
//   public tokenPairs: ITokenPair[] = [];
//   public tokenPrices: Map<string, ITokenPrice>;
//   public maxPriceShift = 100;
//   public orderBook: IOrderBook = {
//     buyLevels: [],
//     sellLevels: [],
//     change: 0,
//     lastPrice: 0,
//     lastPriceUsd: 0,
//   };
//
//   constructor() {
//     this.tokens = tokens;
//     this.tokenPairs = makePairs();
//     this.tokenPrices = new Map<string, ITokenPrice>(
//       makePrices(tokens).map((tp) => [tp.token, tp])
//     );
//   }
//
//   public shiftPrices = () => {
//     for (let tokenPrice of this.tokenPrices.values()) {
//       tokenPrice.priceUsd += randomShift(this.maxPriceShift);
//       if (tokenPrice.priceUsd < 0) {
//         tokenPrice.priceUsd = 0;
//       }
//     }
//   };
//
//   public updateOrderBook = (tokenPair: ITokenPair) => {
//     const basePriceUsd = this.tokenPrices.get(tokenPair.baseToken)!.priceUsd;
//     const quotePriceUsd = this.tokenPrices.get(tokenPair.quoteToken)!.priceUsd;
//     const price = basePriceUsd / quotePriceUsd;
//     const sellLevels: IPriceLevel[] = [];
//     const buyLevels: IPriceLevel[] = [];
//     const step = 0.0001;
//     for (let i = -30; i < 0; i += 1) {
//       buyLevels.push({
//         price: price + i * step,
//         amount: Math.random() * 200000,
//         total: Math.random(), // TODO
//       });
//     }
//     for (let i = 1; i < 30; i += 1) {
//       sellLevels.push({
//         price: price + i * step,
//         amount: Math.random() * 200000,
//         total: Math.random(), // TODO
//       });
//     }
//     this.orderBook.sellLevels = sellLevels;
//     this.orderBook.buyLevels = buyLevels;
//     this.orderBook.change = Math.random();
//     this.orderBook.lastPrice = price;
//     this.orderBook.lastPriceUsd = basePriceUsd;
//   };
// }

// export class MessageHandler {
//   public dataSource = new DataSource();
//
//   public onMessage(message: any) {
//     const obj = JSON.parse(message) as any;
//     if (obj.type === "tokenPairs") {
//       return JSON.stringify({
//         type: "tokenPairs",
//         data: this.dataSource.tokenPairs,
//       });
//     }
//     if (obj.type === "tokenPrices") {
//       this.dataSource.shiftPrices();
//       return JSON.stringify({
//         type: "tokenPrices",
//         data: [...this.dataSource.tokenPrices.values()], // TODO
//       });
//     }
//     if (obj.type === "orderBook") {
//       const tokenPair = obj.tokenPair as ITokenPair;
//       this.dataSource.updateOrderBook(tokenPair);
//       return JSON.stringify({
//         type: "orderBook",
//         data: this.dataSource.orderBook,
//       });
//     }
//   }
// }

export class DummyServer {
  private _tokenPairs: ITokenPair[] = makePairs();
  private _tokenPrices: Map<string, ITokenPrice>;
  private _maxPriceShift = 100;

  constructor() {
    this._tokenPrices = new Map<string, ITokenPrice>(
      makePrices(tokens).map((tp) => [tp.token, tp])
    );
  }

  private shiftPrices = () => {
    for (let tokenPrice of this._tokenPrices.values()) {
      tokenPrice.priceUsd += randomShift(this._maxPriceShift);
      if (tokenPrice.priceUsd < 0) {
        tokenPrice.priceUsd = 0;
      }
    }
  };

  private _priceStream = timer(0, 500).pipe(
    tap(() => {
      this.shiftPrices();
    }),
    map(() => Array.from(this._tokenPrices.values())),
    share()
  );

  public getTokenPairs(): Observable<string[]> {
    return from([
      this._tokenPairs.map((p) => [p.baseToken, p.quoteToken].join("/")),
    ]);
  }

  public getPriceStream(): Observable<ITokenPrice[]> {
    return this._priceStream;
  }

  public getOrderBook(
    tokenPair: string,
    priceLevelSize: number
  ): Observable<IOrderBook> {
    return timer(0, 500).pipe(
      map(() => {
        const [baseToken, quoteToken] = tokenPair.split("/");
        const basePriceUsd = this._tokenPrices.get(baseToken)!.priceUsd;
        const quotePriceUsd = this._tokenPrices.get(quoteToken)!.priceUsd;
        const price = basePriceUsd / quotePriceUsd;
        const sellLevels: IPriceLevel[] = [];
        const buyLevels: IPriceLevel[] = [];
        const step = 0.0001;
        for (let i = -30; i < 0; i += 1) {
          buyLevels.push({
            price: price + i * step,
            amount: Math.random() * 200000,
            total: Math.random(), // TODO
          });
        }
        for (let i = 1; i < 30; i += 1) {
          sellLevels.push({
            price: price + i * step,
            amount: Math.random() * 200000,
            total: Math.random(), // TODO
          });
        }
        return {
          sellLevels,
          buyLevels,
          change: Math.random(),
          lastPrice: price,
          lastPriceUsd: basePriceUsd,
        };
      })
    );
  }
}
