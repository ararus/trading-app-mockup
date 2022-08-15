import { IOrderBook, IPriceLevel } from "../dtos";
import { action, makeObservable, observable } from "mobx";

export class OrderBookStore {
  public buyLevels = observable.array<IPriceLevel>([]);
  public sellLevels = observable.array<IPriceLevel>([]);
  public lastPrice: number = 0;
  public lastPriceUsd: number = 0;
  public change: number = 0;

  constructor() {
    makeObservable(this, {
      update: action,
      lastPrice: observable,
      lastPriceUsd: observable,
      change: observable,
    });
  }

  public update(orderBook: IOrderBook) {
    this.buyLevels.replace(orderBook.buyLevels);
    this.sellLevels.replace(orderBook.sellLevels);
    this.lastPrice = orderBook.lastPrice;
    this.lastPriceUsd = orderBook.lastPriceUsd;
    this.change = orderBook.change;
  }
}
