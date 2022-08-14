import { ITokenPair, ITokenPrice } from "./dtos";
import { mainTokens, tokens } from "./data/tokens";

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

export class DataSource {
  public tokens: string[] = [];
  public tokenPairs: ITokenPair[] = [];
  public tokenPrices: ITokenPrice[] = [];
  public maxPriceShift = 100;

  constructor() {
    this.tokens = tokens;
    this.tokenPairs = makePairs();
    this.tokenPrices = makePrices(tokens);
  }

  public shiftPrices = () => {
    for (let tokenPrice of this.tokenPrices) {
      tokenPrice.priceUsd += randomShift(this.maxPriceShift);
      if (tokenPrice.priceUsd < 0) {
        tokenPrice.priceUsd = 0;
      }
    }
  };
}

export class MessageHandler {
  public dataSource = new DataSource();

  public onMessage(message: any) {
    const obj = JSON.parse(message) as any;
    if (obj.type === "tokenPairs") {
      return JSON.stringify({
        type: "tokenPairs",
        data: this.dataSource.tokenPairs,
      });
    }
    if (obj.type === "tokenPrices") {
      this.dataSource.shiftPrices();
      return JSON.stringify({
        type: "tokenPrices",
        data: this.dataSource.tokenPrices,
      });
    }
  }
}
