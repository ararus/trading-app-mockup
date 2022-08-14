import { action, computed, makeObservable, observable } from "mobx";
import { TokenPair } from "./TokenPair";

export class TokenPairInfo {
  public readonly tokenPair: TokenPair;
  private readonly _isFavorite = observable.box<boolean>(false);
  private readonly _lastPrice = observable.box<number>(0);
  private readonly _lastPriceUsd = observable.box<number>(0);
  private readonly _change24h = observable.box<number>(0);

  constructor(tokenPair: TokenPair, isFavorite?: boolean) {
    makeObservable(this, {
      isFavorite: computed,
      setFavorite: action,
      lastPrice: computed,
      lastPriceUsd: computed,
      updatePrice: action,
      change24h: computed,
      setChange24h: action,
    });
    this.tokenPair = tokenPair;
    this._isFavorite.set(!!isFavorite);
  }

  public get isFavorite(): boolean {
    return this._isFavorite.get();
  }

  public setFavorite(isFavorite: boolean) {
    this._isFavorite.set(isFavorite);
  }

  public get lastPrice(): number {
    return this._lastPrice.get();
  }

  public get lastPriceUsd(): number {
    return this._lastPriceUsd.get();
  }

  public updatePrice(lastPrice: number, lastPriceUsd: number) {
    this._lastPrice.set(lastPrice);
    this._lastPriceUsd.set(lastPriceUsd);
  }

  public get change24h(): number {
    return this._change24h.get();
  }

  public setChange24h(change: number) {
    this._change24h.set(change);
  }
}
