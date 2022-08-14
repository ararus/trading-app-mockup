import { action, computed, makeObservable, observable } from "mobx";
import { mainTokens, tokens } from "../data/tokens";
import { TokenPair } from "./TokenPair";
import { TokenPairInfo } from "./TokenPairInfo";
import { TokenSelectorStore } from "./TokenSelectorStore";
import { ConnectionStore } from "./ConnectionStore";
import { ITokenPair, ITokenPrice } from "../dtos";
import { OrderFormStore } from "./OrderFormStore";

export class RootStore {
  public readonly tokens = observable.array<string>(tokens);
  private readonly _tokenPairs = observable.array<TokenPair>([]);
  private readonly _tokenPairInfos = observable.array<TokenPairInfo>([]);
  private readonly _tokenPricesUsd = observable.map<string, number>();

  public readonly tokenSelector: TokenSelectorStore;
  public readonly connection: ConnectionStore;
  public readonly orderForm: OrderFormStore;

  constructor() {
    makeObservable(this, {
      tokenPairInfos: computed,
      updatePrices: action,
      currentTokenPrice: computed,
    });
    this.tokenSelector = new TokenSelectorStore(this);
    this.connection = new ConnectionStore(this);
    this.orderForm = new OrderFormStore(this);
  }

  public get tokenPairInfos(): TokenPairInfo[] {
    return this._tokenPairInfos;
  }

  public get currentTokenPrice() {
    const currentTokenPair = this.tokenSelector.selectedTokenPair;
    if (!currentTokenPair) {
      return undefined;
    }
    const basePriceUsd = this._tokenPricesUsd.get(currentTokenPair.baseToken);
    const quotePriceUsd = this._tokenPricesUsd.get(currentTokenPair.quoteToken);
    if (!basePriceUsd || !quotePriceUsd) {
      return undefined;
    }
    return basePriceUsd / quotePriceUsd;
  }

  public updateTokenPairs(pairs: ITokenPair[]) {
    const tokenPairs: TokenPair[] = [];
    pairs.forEach((dto) => {
      const tp = new TokenPair(dto.baseToken, dto.quoteToken);
      tokenPairs.push(tp);
    });
    const tokenPairInfos: TokenPairInfo[] = [];
    tokenPairs.forEach((tokenPair) => {
      const tpi = new TokenPairInfo(tokenPair, false);
      tokenPairInfos.push(tpi);
    });
    this._tokenPairs.replace(tokenPairs);
    this._tokenPairInfos.replace(tokenPairInfos);
  }

  public updatePrices(prices: ITokenPrice[]) {
    const m = new Map<string, number>();
    for (let x of prices) {
      m.set(x.token, x.priceUsd);
    }
    this._tokenPricesUsd.replace(m);

    for (let tpi of this._tokenPairInfos) {
      const priceUsd = m.get(tpi.tokenPair.baseToken)!;
      const price = priceUsd / m.get(tpi.tokenPair.quoteToken)!;
      tpi.updatePrice(price, priceUsd);
    }
    setTimeout(this.connection.requestPrices, 1000);
  }
}
