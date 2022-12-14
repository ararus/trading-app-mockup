import { mainTokens, tokens } from "./data/tokens";
import { from, map, Observable, share, tap, timer } from "rxjs";
import {
  IDummyService,
  IOpenOrders,
  IOrderBook,
  IPriceLevel,
  ITokenPair,
  ITokenPrice,
} from "./generated/ExampleModule1";

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

function randomItem<T>(source: T[]) {
  const idx = Math.floor(Math.random() * source.length);
  return source[idx];
}

function randomNumber(min: number, max: number, dp: number) {
  const m = Math.pow(10, dp);
  return Math.round(m * Math.random() * (max - min) + min) / m;
}

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

export class DummyServer implements IDummyService {
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

  public getOpenOrders(): Observable<IOpenOrders> {
    return timer(0, 1000).pipe(
      map(() => {
        const items = [];
        for (let i = 0; i < 100; i++) {
          const { baseToken, quoteToken } = randomItem(this._tokenPairs);
          const tokenPair = [baseToken, quoteToken].join("/");

          items.push({
            id: `order${i + 1}`,
            price: randomNumber(1, 100000, 4),
            failed: randomNumber(1, 100000, 4),
            time: new Date().toISOString(),
            amount: randomNumber(1, 1000, 4),
            side: Math.random() < 0.5 ? "Buy" : "Sell",
            tokenPair,
          });
        }
        return {
          items,
        };
      })
    );
  }
}
