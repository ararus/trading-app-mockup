import { NumericField } from "./NumericField";
import {
  action,
  computed,
  makeObservable,
  observable,
  IObservableArray,
} from "mobx";
import { RootStore } from "./RootStore";

export type BuySell = "Buy" | "Sell";

export class ProfitTargetStore {
  public readonly profit: NumericField;
  public readonly targetPrice: NumericField;
  public readonly amountToSell: NumericField;
  private readonly _parent: OrderFormStore;

  public constructor(parent: OrderFormStore) {
    makeObservable(this, {
      delete: action,
      canDelete: computed,
    });
    this._parent = parent;
    this.profit = new NumericField(0, 4);
    this.targetPrice = new NumericField(0, 4);
    this.amountToSell = new NumericField(0, 4);
  }

  public get canDelete(): boolean {
    return this._parent.profitTargets.length > 1;
  }

  public delete = () => {
    this._parent.deleteProfitTarget(this);
  };
}

export class StopLossStore {
  public readonly stopLoss: NumericField;
  public readonly targetPrice: NumericField;
  private readonly _parent: OrderFormStore;

  constructor(parent: OrderFormStore) {
    makeObservable(this, {});
    this._parent = parent;
    this.stopLoss = new NumericField(0, 2);
    this.targetPrice = new NumericField(0, 2);
  }
}

export class OrderFormStore {
  private readonly _rootStore: RootStore;
  public readonly price = new NumericField(0, 2);
  public readonly amount = new NumericField(0, 2);
  public readonly total = new NumericField(0, 2);
  private readonly _side = observable.box<BuySell>("Buy");
  private readonly _takeProfit = observable.box<boolean>(false);
  private readonly _profitTargets: IObservableArray<ProfitTargetStore>;
  private readonly _stopLoss = observable.box<boolean>(false);

  constructor(rootStore: RootStore) {
    makeObservable(this, {
      side: computed,
      setSide: action,
      takeProfit: computed,
      setTakeProfit: action,
      stopLoss: computed,
      setStopLoss: action,
      profitTargets: computed,
      addProfitTarget: action,
      deleteProfitTarget: action,
    });
    this._rootStore = rootStore;
    this._profitTargets = observable.array([new ProfitTargetStore(this)]);
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

  public get profitTargets(): ProfitTargetStore[] {
    return this._profitTargets;
  }

  public get stopLoss() {
    return this._stopLoss.get();
  }

  public setStopLoss = (stopLoss: boolean) => {
    this._stopLoss.set(stopLoss);
  };

  public addProfitTarget = () => {
    this._profitTargets.push(new ProfitTargetStore(this));
  };

  public deleteProfitTarget = (target: ProfitTargetStore) => {
    if (this._profitTargets.length > 1) {
      this._profitTargets.remove(target);
    }
  };
}
