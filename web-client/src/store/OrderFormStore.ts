import { NumericField } from "./NumericField";
import { action, computed, makeObservable, observable } from "mobx";
import { RootStore } from "./RootStore";

export type BuySell = "Buy" | "Sell";

export class OrderFormStore {
  private readonly _rootStore: RootStore;
  public readonly price = new NumericField(0, 2);
  public readonly amount = new NumericField(0, 2);
  public readonly total = new NumericField(0, 2);
  private readonly _side = observable.box<BuySell>("Buy");
  private readonly _takeProfit = observable.box<boolean>(false);
  private readonly _stopLoss = observable.box<boolean>(false);

  constructor(rootStore: RootStore) {
    makeObservable(this, {
      side: computed,
      setSide: action,
      takeProfit: computed,
      setTakeProfit: action,
      stopLoss: computed,
      setStopLoss: action,
    });
    this._rootStore = rootStore;
  }

  public get side() {
    return this._side.get();
  }

  public setSide = (side: BuySell) => {
    this._side.set(side);
  };

  public get takeProfit() {
    return this._takeProfit.get();
  }

  public setTakeProfit = (takeProfit: boolean) => {
    this._takeProfit.set(takeProfit);
  };

  public get stopLoss() {
    return this._stopLoss.get();
  }

  public setStopLoss = (stopLoss: boolean) => {
    this._stopLoss.set(stopLoss);
  };
}
