import { IOpenOrders } from "../dtos";
import { BuySell } from "./OrderFormStore";
import { action, computed, makeObservable, observable } from "mobx";
import { RootStore } from "./RootStore"; // TODO

export type orderType = "Limit" | "Market"; // TODO

export class OpenOrder {
  public readonly id: string;
  public readonly tokenPair: string;
  public readonly side: BuySell;
  public readonly amount: number;
  public readonly failed: number;
  public readonly price: number;
  public readonly time: Date;

  public constructor(
    id: string,
    tokenPair: string,
    side: BuySell,
    amount: number,
    failed: number,
    price: number,
    time: Date
  ) {
    this.id = id;
    this.tokenPair = tokenPair;
    this.side = side;
    this.amount = amount;
    this.failed = failed;
    this.price = price;
    this.time = time;
  }
}

export class OpenOrdersStore {
  private readonly _orders = observable.array<OpenOrder>([]);
  private readonly _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    makeObservable(this, {
      orders: computed,
      update: action,
    });
    this._rootStore = rootStore;
  }

  public get orders(): OpenOrder[] {
    return this._orders;
  }

  public update(orders: IOpenOrders) {
    const next = orders.items.map((x) => {
      const tokenPair = x.tokenPair;
      const side = x.side as BuySell;
      const amount = x.amount;
      const failed = x.failed;
      const price = x.price;
      const time = new Date(x.time);
      return new OpenOrder(x.id, tokenPair, side, amount, failed, price, time);
    });
    this._orders.replace(next);
    // console.log(`Open orders updated`);
  }
}
